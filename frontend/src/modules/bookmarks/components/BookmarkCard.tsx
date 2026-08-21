import React, { useState } from 'react';
import type { Bookmark } from '../types/bookmark.types';
import { Dropdown } from '../../../components/ui/Dropdown/Dropdown';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Star,
  Clock,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/BookmarkCard.module.scss';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
  onToggleFavorite?: (bookmark: Bookmark) => void;
  onToggleReadLater?: (bookmark: Bookmark) => void;
  onToggleArchive?: (bookmark: Bookmark) => void;
  isSelected?: boolean;
  onSelect?: (bookmarkId: string, selected: boolean) => void;
  isSelectionMode?: boolean;
  readOnly?: boolean;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleReadLater,
  onToggleArchive,
  isSelected = false,
  onSelect,
  isSelectionMode = false,
  readOnly = false,
}) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const targetUrl = React.useMemo(() => {
    if (!bookmark.url) return '#';
    return bookmark.url.startsWith('http://') || bookmark.url.startsWith('https://')
      ? bookmark.url
      : `https://${bookmark.url}`;
  }, [bookmark.url]);

  const faviconUrl = React.useMemo(() => {
    if (bookmark.favicon) return bookmark.favicon;
    if (bookmark.domain) {
      return `https://www.google.com/s2/favicons?domain=${bookmark.domain}&sz=64`;
    }
    return '';
  }, [bookmark.favicon, bookmark.domain]);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }
    if (isSelectionMode && onSelect) {
      onSelect(bookmark.id, !isSelected);
      return;
    }
    // Directly open target destination website in a new tab
    if (targetUrl && targetUrl !== '#') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const menuItems = [
    {
      label: 'Open in New Tab',
      icon: <ExternalLink size={16} />,
      onClick: () => window.open(targetUrl, '_blank', 'noopener,noreferrer'),
    },
    {
      label: 'View Details',
      icon: <ExternalLink size={16} />,
      onClick: () => navigate(`/bookmarks/${bookmark.id}`),
    },
    ...(onEdit && !readOnly ? [{
      label: 'Edit Bookmark',
      icon: <Edit2 size={16} />,
      onClick: () => onEdit(bookmark),
    }] : []),
    ...(onToggleArchive && !readOnly ? [{
      label: bookmark.isArchived ? 'Unarchive' : 'Archive',
      icon: <Trash2 size={16} />,
      onClick: () => onToggleArchive(bookmark),
    }] : []),
    ...(onDelete && !readOnly ? [{
      label: 'Delete Bookmark',
      icon: <Trash2 size={16} />,
      danger: true,
      onClick: () => onDelete(bookmark),
    }] : []),
  ];

  const triggerBtn = (
    <button className={styles.menuBtn} aria-label="Bookmark options" onClick={(e) => e.stopPropagation()}>
      <MoreVertical size={18} />
    </button>
  );

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
      title={`Open ${bookmark.title} (${targetUrl})`}
    >
      <div className={styles.cardContent}>
        <div className={styles.titleRow}>
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(bookmark.id, e.target.checked)}
              style={{ marginRight: '0.5rem', cursor: 'pointer' }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '0.5rem' }}>
            {!imgError && faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                className={styles.favicon}
                onError={() => setImgError(true)}
                style={{ width: '18px', height: '18px', borderRadius: '4px' }}
              />
            ) : (
              <Globe size={16} style={{ color: 'var(--accent-color, #38bdf8)' }} />
            )}
          </div>

          <div className={styles.titleGroup}>
            <h3 className={styles.title}>{bookmark.title}</h3>
            <div className={styles.domain}>
              <span className={styles.domainText}>{bookmark.domain || 'External Link'}</span>
            </div>
          </div>
          <Dropdown trigger={triggerBtn} items={menuItems} align="right" />
        </div>

        {bookmark.description && (
          <p className={styles.description}>{bookmark.description}</p>
        )}

        {bookmark.collectionName && (
          <span className={styles.collectionBadge}>
            📁 {bookmark.collectionName}
          </span>
        )}

        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className={styles.tags}>
            {bookmark.tags.map((tag) => (
              <span key={tag.id} className={styles.tagBadge}>
                <span
                  className={styles.tagDot}
                  style={{ backgroundColor: tag.color || '#3b82f6' }}
                />
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {bookmark.archiveStatus && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            {bookmark.archiveStatus === 'pending' && <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>⏳ Archiving...</span>}
            {bookmark.archiveStatus === 'success' && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>✅ Archived</span>}
            {bookmark.archiveStatus === 'failed' && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>❌ Archive Failed</span>}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          {!readOnly && onToggleFavorite && (
            <button
              className={`${styles.actionBtn} ${bookmark.isFavorite ? styles.favoriteActive : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(bookmark);
              }}
              aria-label={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={16} fill={bookmark.isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          {!readOnly && onToggleReadLater && (
            <button
              className={`${styles.actionBtn} ${bookmark.readLater ? styles.readLaterActive : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleReadLater(bookmark);
              }}
              aria-label={bookmark.readLater ? 'Remove from read later' : 'Read later'}
              title={bookmark.readLater ? 'Remove from read later' : 'Read later'}
            >
              <Clock size={16} fill={bookmark.readLater ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        <div className={styles.footerRight}>
          <span className={styles.date}>{formatDate(bookmark.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
