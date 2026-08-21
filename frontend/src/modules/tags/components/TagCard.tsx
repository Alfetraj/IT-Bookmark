import React from 'react';
import type { Tag } from '../types/tag.types';
import { Dropdown } from '../../../components/ui/Dropdown/Dropdown';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import styles from '../styles/TagCard.module.scss';

interface TagCardProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export const TagCard: React.FC<TagCardProps> = ({ tag, onEdit, onDelete }) => {
  const menuItems = [
    {
      label: 'Edit Tag',
      icon: <Edit2 size={16} />,
      onClick: () => onEdit(tag),
    },
    {
      label: 'Delete Tag',
      icon: <Trash2 size={16} />,
      danger: true,
      onClick: () => onDelete(tag),
    },
  ];

  const triggerBtn = (
    <button className={styles.menuBtn} aria-label="Tag options">
      <MoreVertical size={18} />
    </button>
  );

  return (
    <div className={styles.card}>
      <div className={styles.tagInfo}>
        <div
          className={styles.colorIndicator}
          style={{ backgroundColor: tag.color || '#3b82f6' }}
        />
        <div className={styles.nameGroup}>
          <h3 className={styles.tagName}>{tag.name}</h3>
          <span className={styles.tagSlug}>#{tag.slug}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <span className={styles.bookmarkCount}>
          {tag.bookmarkCount || 0} {tag.bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
        </span>
        <Dropdown trigger={triggerBtn} items={menuItems} align="right" />
      </div>
    </div>
  );
};
