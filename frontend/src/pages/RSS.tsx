import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';
import styles from './RSS.module.scss';

interface RSSSubscription {
  id: string;
  url: string;
  name: string;
  last_polled_at: string | null;
  status: 'active' | 'error';
  error_message: string | null;
}

const RSS: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<RSSSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/rss');
      setSubscriptions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch RSS subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newName) return;
    
    try {
      await api.post('/rss', { url: newUrl, name: newName });
      setNewUrl('');
      setNewName('');
      fetchSubscriptions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add RSS subscription');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/rss/${id}`);
      setSubscriptions(subs => subs.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete RSS subscription');
    }
  };

  return (
    <div className={styles.rssContainer}>
      <div className={styles.header}>
        <h2>RSS Feeds</h2>
        <p>Subscribe to RSS feeds to automatically bookmark new articles.</p>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.addForm}>
        <h3>Add New Feed</h3>
        <form onSubmit={handleAdd}>
          <div className={styles.formGroup}>
            <input 
              type="text" 
              placeholder="Feed Name (e.g. Hacker News)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <input 
              type="url" 
              placeholder="Feed URL (e.g. https://news.ycombinator.com/rss)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
            />
            <button type="submit" className={styles.addButton}>
              <Plus size={18} /> Add
            </button>
          </div>
        </form>
      </div>

      <div className={styles.subscriptionsList}>
        <h3>Your Subscriptions</h3>
        {loading ? (
          <p>Loading...</p>
        ) : subscriptions.length === 0 ? (
          <p className={styles.emptyState}>No RSS subscriptions yet.</p>
        ) : (
          <div className={styles.grid}>
            {subscriptions.map(sub => (
              <div key={sub.id} className={`${styles.card} ${sub.status === 'error' ? styles.cardError : ''}`}>
                <div className={styles.cardHeader}>
                  <h4>{sub.name}</h4>
                  <button onClick={() => handleDelete(sub.id)} className={styles.deleteBtn}>
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.url}>{sub.url}</p>
                  <p className={styles.lastPolled}>
                    <RefreshCw size={14} /> 
                    {sub.last_polled_at ? new Date(sub.last_polled_at).toLocaleString() : 'Never polled'}
                  </p>
                  {sub.status === 'error' && sub.error_message && (
                    <p className={styles.errorMessage}>{sub.error_message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RSS;
