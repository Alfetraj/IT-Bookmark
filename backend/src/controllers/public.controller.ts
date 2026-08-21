import { Request, Response } from 'express';
import { collectionService } from '../services/collection.service';
import { supabase } from '../config/supabase';

export const getPublicCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    if (!token) {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    const collection = await collectionService.getCollectionByShareToken(token);
    if (!collection) {
      res.status(404).json({ error: 'Collection not found or access revoked' });
      return;
    }

    // Fetch bookmarks for this collection directly
    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select('id, url, title, description, created_at')
      .eq('collection_id', collection.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({
      collection,
      bookmarks: bookmarks || []
    });
  } catch (error: any) {
    console.error('Error fetching public collection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
