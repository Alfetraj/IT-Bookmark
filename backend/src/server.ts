import dotenv from 'dotenv';
import { queueManager } from './config/queue';
import { setupArchiveWorker } from './workers/archive.worker';
import { setupIndexWorker } from './workers/index.worker';
import { setupRssWorker } from './workers/rss.worker';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Connect to job queue
  await queueManager.connect();
  
  // Register workers
  await setupArchiveWorker();
  await setupIndexWorker();
  await setupRssWorker();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await queueManager.disconnect();
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();

export default startServer;