const PgBoss = require('pg-boss');
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

class QueueManager {
  private boss: any = null;
  private isConnected = false;

  constructor() {
    if (connectionString) {
      this.boss = new PgBoss(connectionString);
      
      this.boss.on('error', (error: any) => {
        console.error('pg-boss error:', error);
      });
    } else {
      console.warn('DATABASE_URL is not set. Background jobs (pg-boss) will be disabled.');
    }
  }

  async connect() {
    if (!this.boss) return;
    if (this.isConnected) return;

    try {
      await this.boss.start();
      this.isConnected = true;
      console.log('pg-boss started successfully.');
    } catch (error) {
      console.error('Failed to start pg-boss:', error);
    }
  }

  async disconnect() {
    if (!this.boss || !this.isConnected) return;
    
    try {
      await this.boss.stop();
      this.isConnected = false;
      console.log('pg-boss stopped gracefully.');
    } catch (error) {
      console.error('Failed to stop pg-boss:', error);
    }
  }

  async send(queue: string, data: any, options?: any) {
    if (!this.boss || !this.isConnected) {
      console.warn(`Cannot send job to queue '${queue}': pg-boss is not connected.`);
      return null;
    }
    return await this.boss.send(queue, data, options);
  }

  async work(queue: string, handler: (job: any) => Promise<void>) {
    if (!this.boss || !this.isConnected) {
      console.warn(`Cannot register worker for queue '${queue}': pg-boss is not connected.`);
      return;
    }
    await this.boss.work(queue, handler);
  }

  async schedule(queue: string, cron: string, data?: any, options?: any) {
    if (!this.boss || !this.isConnected) {
      console.warn(`Cannot schedule job for queue '${queue}': pg-boss is not connected.`);
      return;
    }
    await this.boss.schedule(queue, cron, data, options);
  }
}

export const queueManager = new QueueManager();
