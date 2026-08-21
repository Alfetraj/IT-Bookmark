import { supabase } from '../config/supabase';
import { queueManager } from '../config/queue';

interface IndexTask {
  bookmarkId: string;
  userId: string;
}

export const setupIndexWorker = async () => {
  await queueManager.work('bookmark.index', async (job: any) => {
    const task = job.data as IndexTask;
    console.log(`Processing search index job for bookmark ${task.bookmarkId}`);
    
    try {
      // Fetch the bookmark data needed for the index
      const { data: bookmark, error: fetchError } = await supabase
        .from('bookmarks')
        .select('title, description, url, readability_content')
        .eq('id', task.bookmarkId)
        .single();
        
      if (fetchError || !bookmark) {
        throw new Error(`Failed to fetch bookmark ${task.bookmarkId} for indexing: ${fetchError?.message}`);
      }
      
      // We will generate the tsvector update SQL. Since we are using Supabase JS which doesn't
      // easily let us do raw SQL updates like `UPDATE ... SET search_index = to_tsvector(...)`,
      // we need to call an RPC to update the index.
      const { error: rpcError } = await supabase.rpc('update_bookmark_search_index', {
        p_bookmark_id: task.bookmarkId,
        p_title: bookmark.title || '',
        p_description: bookmark.description || '',
        p_url: bookmark.url || '',
        p_content: bookmark.readability_content || ''
      });

      if (rpcError) {
        throw new Error(`RPC update_bookmark_search_index failed: ${rpcError.message}`);
      }

      console.log(`Successfully indexed bookmark ${task.bookmarkId}`);
    } catch (error) {
      console.error(`Indexing failed for ${task.bookmarkId}:`, error);
      throw error; // Let pg-boss handle retries
    }
  });
};
