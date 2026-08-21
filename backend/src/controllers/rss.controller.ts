import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const getUserId = (req: Request): string | null => {
  return (req as any).user?.userId || (req as any).user?.id || null;
};

export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { url, name, collection_id } = req.body;
    
    if (!url || !name) {
      res.status(400).json({ error: 'URL and name are required' });
      return;
    }

    const { data, error } = await supabase
      .from('rss_subscriptions')
      .insert({
        user_id: userId,
        url,
        name,
        collection_id: collection_id || null
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating RSS subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
      return;
    }

    res.status(201).json(data);
  } catch (err) {
    logger.error('Unexpected error creating RSS subscription:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('rss_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching RSS subscriptions:', error);
      res.status(500).json({ error: 'Failed to fetch subscriptions' });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    logger.error('Unexpected error fetching RSS subscriptions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('rss_subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting RSS subscription:', error);
      res.status(500).json({ error: 'Failed to delete subscription' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    logger.error('Unexpected error deleting RSS subscription:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
