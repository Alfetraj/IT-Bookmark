import React from 'react';
import { motion } from 'framer-motion';
import { Folder, ArrowUpDown, LayoutGrid, Network } from 'lucide-react';
import { AutoCategorizeButton } from '../../../components/ui/AutoCategorizeButton/AutoCategorizeButton';
import styles from '../styles/CollectionHeader.module.scss';

export type CollectionSortOption = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';

interface CollectionHeaderProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onCreateClick?: () => void;
  showCreateButton?: boolean;
  sortBy?: CollectionSortOption;
  onSortChange?: (sort: CollectionSortOption) => void;
  viewMode?: 'grid' | 'tree';
  onViewModeChange?: (mode: 'grid' | 'tree') => void;
  showViewToggle?: boolean;
  onAutoCategorize?: () => void;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  title = 'Collections',
  description = 'Collections you own',
  icon,
  sortBy = 'date_desc',
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = false,
  onAutoCategorize,
}) => {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.leftGroup}>
        <div className={styles.iconWrapper}>
          {icon || <Folder size={22} className={styles.folderIcon} />}
        </div>
        <div className={styles.titleInfo}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
          </div>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>

      <div className={styles.rightGroup}>
        {onAutoCategorize && (
          <AutoCategorizeButton onCategorize={onAutoCategorize} />
        )}

        {showViewToggle && onViewModeChange && (
          <div className={styles.viewToggle}>
            <motion.button
              className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => onViewModeChange('grid')}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid size={16} />
            </motion.button>
            <motion.button
              className={`${styles.toggleBtn} ${viewMode === 'tree' ? styles.active : ''}`}
              onClick={() => onViewModeChange('tree')}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              title="Tree View"
              aria-label="Tree View"
            >
              <Network size={16} />
            </motion.button>
          </div>
        )}

        {onSortChange && (
          <div className={styles.sortWrapper}>
            <ArrowUpDown size={15} className={styles.sortIcon} />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as CollectionSortOption)}
              className={styles.sortSelect}
              aria-label="Sort collections"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="name_asc">Name (A to Z)</option>
              <option value="name_desc">Name (Z to A)</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
