import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookmarkService } from '../modules/bookmarks/services/bookmark.service';
import type { Bookmark } from '../modules/bookmarks/types/bookmark.types';
import { BookmarkDetail as BookmarkDetailComponent } from '../modules/bookmarks/components/BookmarkDetail';
import { ArrowLeft } from 'lucide-react';

export const BookmarkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmark = async () => {
      if (!id) return;
      try {
        // Ideally we fetch a single bookmark. Wait, does bookmarkService have getBookmarkById?
        // In most of our setups, we have getBookmarks and we can just filter, or we implement getBookmarkById.
        // We will assume `bookmarkService.getBookmarks()` is what we have, or we can use `getBookmarkById(id)`.
        // Let's check if getBookmarkById exists on bookmarkService later. If not, this will throw a TS error which we'll fix.
        const data = await bookmarkService.getBookmarks();
        const found = data.find((b: Bookmark) => b.id === id);
        if (found) {
          setBookmark(found);
        } else {
          setError('Bookmark not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load bookmark');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmark();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading bookmark details...</div>;
  }

  if (error || !bookmark) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--error-color)' }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '6px' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '1rem 2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer' 
          }}
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>
      <BookmarkDetailComponent bookmark={bookmark} />
    </div>
  );
};
