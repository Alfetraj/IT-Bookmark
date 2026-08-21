import React from 'react';
import { Search } from 'lucide-react';
import styles from '../styles/TagHeader.module.scss';

interface TagHeaderProps {
  onCreateClick?: () => void;
  tagCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TagHeader: React.FC<TagHeaderProps> = ({
  tagCount,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.titleInfo}>
        <h1>Tags</h1>
        <p>
          Categorize and filter bookmarks using custom tags. You have {tagCount}{' '}
          {tagCount === 1 ? 'tag' : 'tags'}.
        </p>
      </div>

      <div className={styles.actions}>
        <div className={styles.searchBox}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Filter tags..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
};
