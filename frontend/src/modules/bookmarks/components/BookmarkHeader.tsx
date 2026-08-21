import React from 'react';
import { Button } from '../../../components/ui/button/button';
import { Search, Star, Clock, Filter } from 'lucide-react';
import styles from '../styles/BookmarkHeader.module.scss';

interface BookmarkHeaderProps {
  onCreateClick?: () => void;
  bookmarkCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  selectedCount?: number;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onBulkAction?: (action: string) => void;
}

export const BookmarkHeader: React.FC<BookmarkHeaderProps> = ({
  bookmarkCount,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedCount = 0,
  onSelectAll,
  onClearSelection,
  onBulkAction,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.titleInfo}>
        <h1>Bookmarks</h1>
        <p>
          Manage your saved IT resources and documentation. You have {bookmarkCount}{' '}
          {bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}.
        </p>
      </div>

      <div className={styles.actions}>
        {selectedCount > 0 ? (
          <div className={styles.bulkToolbar} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{selectedCount} selected</span>
            <Button variant="secondary" onClick={() => onSelectAll?.()}>Select All</Button>
            <Button variant="secondary" onClick={() => onClearSelection?.()}>Clear</Button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', margin: '0 0.5rem' }} />
            <Button variant="secondary" onClick={() => onBulkAction?.('favorite')}>Favorite</Button>
            <Button variant="secondary" onClick={() => onBulkAction?.('read_later')}>Read Later</Button>
            <Button variant="secondary" onClick={() => onBulkAction?.('archive')}>Archive</Button>
            <Button variant="danger" onClick={() => onBulkAction?.('delete')}>Delete</Button>
          </div>
        ) : (
          <>
            <div className={styles.filterGroup}>
              <button
                className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.active : ''}`}
                onClick={() => onFilterChange('all')}
              >
                <Filter size={14} /> All
              </button>
              <button
                className={`${styles.filterBtn} ${activeFilter === 'favorites' ? styles.active : ''}`}
                onClick={() => onFilterChange('favorites')}
              >
                <Star size={14} /> Favorites
              </button>
              <button
                className={`${styles.filterBtn} ${activeFilter === 'readLater' ? styles.active : ''}`}
                onClick={() => onFilterChange('readLater')}
              >
                <Clock size={14} /> Read Later
              </button>
            </div>

            <div className={styles.searchBox}>
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
};
