import React, { useState, useEffect } from 'react';
import { useSearch } from '../modules/search/hooks/useSearch';
import { BookmarkCard } from '../modules/bookmarks/components/BookmarkCard';
import type { Bookmark } from '../modules/bookmarks/types/bookmark.types';

const Search: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(inputValue), 300);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const { results, isLoading, error } = useSearch(debouncedQuery);

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Search</h1>
                <p style={{ color: 'var(--text-secondary, #6b7280)', margin: '0.5rem 0 1.5rem' }}>
                    Search across all your bookmarks, collections, and tags.
                </p>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search..."
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                    }}
                    autoFocus
                />
            </header>

            {isLoading && debouncedQuery.length > 1 && (
                <div style={{ color: 'var(--text-secondary)' }}>Searching...</div>
            )}

            {error && (
                <div style={{ color: '#ef4444' }}>Error performing search. Please try again.</div>
            )}

            {!isLoading && debouncedQuery.length > 1 && (
                <div>
                    {results.bookmarks.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Bookmarks ({results.bookmarks.length})</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
                                {results.bookmarks.map((bookmark: Bookmark) => (
                                    <BookmarkCard
                                        key={bookmark.id}
                                        bookmark={bookmark}
                                        onEdit={() => {}} // Placeholder for now
                                        onDelete={() => {}}
                                        onToggleFavorite={() => {}}
                                        onToggleReadLater={() => {}}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {results.collections.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Collections ({results.collections.length})</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {results.collections.map((col: any) => (
                                    <div key={col.id} style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: '0.25rem' }}>
                                        {col.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.tags.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Tags ({results.tags.length})</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {results.tags.map((tag: any) => (
                                    <div key={tag.id} style={{ padding: '0.25rem 0.75rem', background: tag.color || 'var(--bg-secondary)', borderRadius: '999px', color: tag.color ? '#fff' : 'inherit' }}>
                                        {tag.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.bookmarks.length === 0 && results.collections.length === 0 && results.tags.length === 0 && (
                        <div style={{ color: 'var(--text-secondary)' }}>No results found for "{debouncedQuery}"</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
