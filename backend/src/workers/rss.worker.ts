import Parser from 'rss-parser';
import { supabase } from '../config/supabase';
import { queueManager } from '../config/queue';
import { logger } from '../utils/logger';
import { validateUrlSSRF } from '../utils/ssrf';
import { decode } from 'he';

const parser = new Parser({
  timeout: 10000,
  maxRedirects: 3,
});

export const processRssSubscription = async (job: any) => {
  const { subscriptionId } = job.data;
  
  if (!subscriptionId) {
    logger.error('RSS worker missing subscriptionId');
    return;
  }

  // Fetch subscription details
  const { data: sub, error: subError } = await supabase
    .from('rss_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();

  if (subError || !sub) {
    logger.error(`Failed to fetch RSS subscription ${subscriptionId}:`, subError);
    return;
  }

  try {
    // SSRF Protection
    const isSafe = await validateUrlSSRF(sub.url);
    if (!isSafe) {
      throw new Error('URL failed SSRF validation');
    }

    // Fetch and parse feed
    const feed = await parser.parseURL(sub.url);
    logger.info(`Parsed RSS feed ${sub.url}, found ${feed.items?.length || 0} items`);

    let bookmarksCreated = 0;

    // Process items
    for (const item of feed.items || []) {
      if (!item.link) continue;

      const linkSafe = await validateUrlSSRF(item.link);
      if (!linkSafe) {
        logger.warn(`Skipping unsafe RSS item link: ${item.link}`);
        continue;
      }

      const url = item.link.trim().slice(0, 2047);
      
      // Deduplication check
      const { data: existingBkmk } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', sub.user_id)
        .eq('url', url)
        .maybeSingle();

      if (existingBkmk) {
        continue; // Already bookmarked
      }

      // Prepare metadata
      const title = decode(item.title || url).trim().slice(0, 254);
      const description = item.contentSnippet ? decode(item.contentSnippet).trim().slice(0, 254) : null;
      let importDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

      // Insert bookmark
      const { data: newBkmk, error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          user_id: sub.user_id,
          collection_id: sub.collection_id,
          url,
          title,
          description,
          import_date: importDate
        })
        .select('id')
        .single();

      if (insertError) {
        logger.error(`Error inserting RSS bookmark ${url}:`, insertError);
        continue;
      }

      bookmarksCreated++;

      // Enqueue archive job
      if (newBkmk) {
        await queueManager.send('bookmark.archive', {
          bookmarkId: newBkmk.id,
          url,
          userId: sub.user_id
        }).catch(err => {
          logger.error(`Failed to enqueue archive for RSS bookmark ${url}:`, err);
        });
      }
    }

    // Update subscription status on success
    await supabase
      .from('rss_subscriptions')
      .update({
        last_polled_at: new Date().toISOString(),
        status: 'active',
        error_message: null
      })
      .eq('id', subscriptionId);

    logger.info(`Successfully processed RSS subscription ${subscriptionId}, created ${bookmarksCreated} bookmarks`);

  } catch (error: any) {
    logger.error(`Error processing RSS subscription ${subscriptionId}:`, error);
    
    // Update subscription status on error
    await supabase
      .from('rss_subscriptions')
      .update({
        status: 'error',
        error_message: error.message || 'Unknown error occurred during fetch'
      })
      .eq('id', subscriptionId);
  }
};

export const scheduleRssJobs = async () => {
  logger.info('Scheduling RSS feed polls');
  try {
    const { data: subs, error } = await supabase
      .from('rss_subscriptions')
      .select('id');
      
    if (error) {
      logger.error('Failed to fetch RSS subscriptions for scheduling', error);
      return;
    }
    
    for (const sub of subs || []) {
      await queueManager.send('rss.poll', { subscriptionId: sub.id });
    }
  } catch (error) {
    logger.error('Unexpected error in scheduleRssJobs:', error);
  }
};

export const setupRssWorker = async () => {
  await queueManager.work('rss.poll', processRssSubscription);
  await queueManager.work('rss.schedule', scheduleRssJobs);
  
  // Schedule the global job every 15 minutes
  await queueManager.schedule('rss.schedule', '*/15 * * * *');
};
