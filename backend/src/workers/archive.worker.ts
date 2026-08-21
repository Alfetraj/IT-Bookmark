import { chromium } from 'playwright';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { supabase } from '../config/supabase';
import { queueManager } from '../config/queue';
import { storageService } from '../services/storage.service';
import type { Job } from 'pg-boss';

interface ArchiveTask {
  bookmarkId: string;
  url: string;
  userId: string;
}

const updateStatus = async (bookmarkId: string, status: 'pending' | 'success' | 'failed') => {
  await supabase
    .from('bookmarks')
    .update({ archive_status: status })
    .eq('id', bookmarkId);
};

export const setupArchiveWorker = async () => {
  await queueManager.work('bookmark.archive', async (job: any) => {
    const task = job.data;
    console.log(`Processing archive job for bookmark ${task.bookmarkId}: ${task.url}`);
    
    try {
      await updateStatus(task.bookmarkId, 'pending');

      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(task.url, { waitUntil: 'networkidle', timeout: 30000 });

      // 1. Take Screenshot
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      const screenshotFileName = `${task.userId}/${task.bookmarkId}/screenshot.png`;
      await storageService.upload(screenshotFileName, screenshotBuffer, 'image/png');

      // 2. Take PDF
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      const pdfFileName = `${task.userId}/${task.bookmarkId}/page.pdf`;
      await storageService.upload(pdfFileName, pdfBuffer, 'application/pdf');

      // 3. Extract Readability Content
      const htmlContent = await page.content();
      const dom = new JSDOM(htmlContent, { url: task.url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      await browser.close();

      // Mark as success and save paths
      await supabase
        .from('bookmarks')
        .update({
          archive_status: 'success',
          screenshot_path: screenshotFileName,
          pdf_path: pdfFileName,
          readability_content: article?.content || article?.textContent || null,
        })
        .eq('id', task.bookmarkId);

      // Enqueue search indexing
      await queueManager.send('bookmark.index', {
        bookmarkId: task.bookmarkId,
        userId: task.userId,
      });

      console.log(`Successfully archived bookmark ${task.bookmarkId}`);
    } catch (error) {
      console.error(`Archiving failed for ${task.url}:`, error);
      await updateStatus(task.bookmarkId, 'failed');
      throw error; // Let pg-boss handle retries
    }
  });
};
