import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BookmarkCard } from '../modules/bookmarks/components/BookmarkCard';
import type { Bookmark } from '../modules/bookmarks/types/bookmark.types';
import styles from './PublicCollection.module.scss';
import type { Collection } from '../modules/collections/types/collection.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const PublicCollection: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        // Use unauthenticated axios since we are public
        const res = await axios.get(`${API_URL}/public/collection/${token}`);
        setCollection(res.data.collection);
        setBookmarks(res.data.bookmarks);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load shared collection');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [token]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading shared collection...</p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className={styles.errorContainer}>
        <h2>Collection Not Found</h2>
        <p>{error}</p>
        <Link to="/" className={styles.homeBtn}>Go to IT-Bookmark</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>{collection.name}</h1>
          {collection.description && <p className={styles.description}>{collection.description}</p>}
          <span className={styles.badge}>Shared Collection</span>
        </div>
      </header>
      
      <main className={styles.main}>
        <div className={styles.bookmarkCount}>
          {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
        </div>

        {bookmarks.length > 0 ? (
          <div className={styles.grid}>
            {bookmarks.map((bookmark) => (
              <BookmarkCard 
                key={bookmark.id} 
                bookmark={bookmark} 
                onDelete={() => {}}
                onEdit={() => {}}
                readOnly={true}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>This collection is empty.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicCollection;
