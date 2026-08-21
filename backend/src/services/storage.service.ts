import { supabase } from '../config/supabase';

export interface StorageProvider {
  upload(path: string, buffer: Buffer, contentType: string): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}

export class SupabaseStorageProvider implements StorageProvider {
  private bucket = 'archives';

  async upload(path: string, buffer: Buffer, contentType: string): Promise<string> {
    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`Supabase upload failed for ${path}:`, error);
      throw error;
    }

    return path;
  }

  async download(path: string): Promise<Buffer> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .download(path);

    if (error || !data) {
      throw new Error(`Failed to download ${path} from Supabase`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async delete(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.bucket)
      .remove([path]);
      
    if (error) {
      throw error;
    }
  }

  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);
      
    return data.publicUrl;
  }
}

// In a real application, this would switch based on process.env.STORAGE_PROVIDER 
// (e.g. 'local', 's3', 'supabase'). For now, we default to Supabase.
export const storageService: StorageProvider = new SupabaseStorageProvider();
