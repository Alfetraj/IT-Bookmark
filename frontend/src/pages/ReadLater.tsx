import React from 'react';
import { useBookmarks } from '../modules/bookmarks/hooks/useBookmarks';
import { BookmarkCard } from '../modules/bookmarks/components/BookmarkCard';

const ReadLater: React.FC = () => {
    const { bookmarks, isLoading, error, toggleFavorite, toggleReadLater } = useBookmarks({ readLater: true });

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading read later...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>Error loading read later.</div>;

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Read Later</h1>
                <p style={{ color: 'var(--text-secondary, #6b7280)', margin: '0.5rem 0 0' }}>
                    Bookmarks you saved to read later.
                </p>
            </header>

            {bookmarks.length === 0 ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No read later bookmarks found.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
                    {bookmarks.map((bookmark) => (
                        <BookmarkCard
                            key={bookmark.id}
                            bookmark={bookmark}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            onToggleFavorite={async (b) => await toggleFavorite({ id: b.id, isFavorite: !b.isFavorite })}
                            onToggleReadLater={async (b) => await toggleReadLater({ id: b.id, readLater: !b.readLater })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReadLater;
