import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Collection } from '../types/collection.types';
import type { Bookmark } from '../../bookmarks/types/bookmark.types';
import { Dropdown } from '../../../components/ui/Dropdown/Dropdown';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  MoreVertical,
  Edit2,
  Trash2,
  Globe,
  Plus,
  ExternalLink,
  Star,
  Clock,
} from 'lucide-react';
import styles from '../styles/CollectionTree.module.scss';
import { useNavigate } from 'react-router-dom';

interface CollectionTreeProps {
  collections: Collection[];
  bookmarks?: Bookmark[];
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onAddSubCollection?: (parentCollection: Collection) => void;
  onShare?: (collection: Collection) => void;
}

interface TreeItemProps {
  node: Collection;
  bookmarksByCollection: Map<string, Bookmark[]>;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onAddSubCollection?: (parentCollection: Collection) => void;
  onShare?: (collection: Collection) => void;
  depth?: number;
}

interface BookmarkItemProps {
  bookmark: Bookmark;
}

// Framer Motion Variants
const listContainerVariants = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  show: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity: { duration: 0.2 },
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.22, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity: { duration: 0.15 },
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const childItemVariants = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
};

const BookmarkTreeItem: React.FC<BookmarkItemProps> = ({ bookmark }) => {
  const [imgError, setImgError] = useState(false);

  // Normalize target URL
  const targetUrl = useMemo(() => {
    if (!bookmark.url) return '#';
    return bookmark.url.startsWith('http://') || bookmark.url.startsWith('https://')
      ? bookmark.url
      : `https://${bookmark.url}`;
  }, [bookmark.url]);

  // Extract hostname from URL
  const hostname = useMemo(() => {
    if (bookmark.domain) return bookmark.domain;
    try {
      return new URL(targetUrl).hostname;
    } catch {
      return '';
    }
  }, [targetUrl, bookmark.domain]);

  // Google S2 Favicon service with 64px resolution
  const faviconUrl = useMemo(() => {
    if (bookmark.favicon) return bookmark.favicon;
    if (hostname) {
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    }
    return '';
  }, [bookmark.favicon, hostname]);

  const handleOpenWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      layout
      variants={childItemVariants}
      className={styles.bookmarkRow}
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={handleOpenWebsite}
      role="button"
      tabIndex={0}
      title={`Open ${bookmark.title} (${targetUrl})`}
    >
      <div className={styles.bookmarkLeft}>
        {/* Dynamic Favicon container with shadow and dark/light mode background */}
        <div className={styles.faviconContainer}>
          {!imgError && faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className={styles.faviconImg}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <Globe size={13} className={styles.defaultFavicon} />
          )}
        </div>

        <span className={styles.bookmarkTitle}>{bookmark.title}</span>

        {hostname && <span className={styles.domainText}>{hostname}</span>}
      </div>

      <div className={styles.bookmarkRight}>
        {bookmark.isFavorite && (
          <span title="Favorite">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
          </span>
        )}
        {bookmark.readLater && (
          <span title="Read Later">
            <Clock size={13} color="#38bdf8" />
          </span>
        )}
        <div className={styles.hoverAction}>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLinkBtn}
            title="Open URL in new tab"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const CollectionTreeNode: React.FC<TreeItemProps> = ({
  node,
  bookmarksByCollection,
  onEdit,
  onDelete,
  onAddSubCollection,
  onShare,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  const childCollections = node.children || [];
  const nodeBookmarks = bookmarksByCollection.get(node.id) || [];
  const hasContent = childCollections.length > 0 || nodeBookmarks.length > 0;

  const menuItems = [
    ...(onAddSubCollection
      ? [
          {
            label: 'Add Sub-collection',
            icon: <Plus size={15} />,
            onClick: () => onAddSubCollection(node),
          },
        ]
      : []),
    ...(onShare
      ? [
          {
            label: 'Share & Collaborate',
            icon: <Globe size={15} />,
            onClick: () => onShare(node),
          },
        ]
      : []),
    {
      label: 'Edit Collection',
      icon: <Edit2 size={15} />,
      onClick: () => onEdit(node),
    },
    {
      label: 'Delete Collection',
      icon: <Trash2 size={15} />,
      danger: true,
      onClick: () => onDelete(node),
    },
  ];

  const triggerBtn = (
    <button
      className={styles.menuBtn}
      aria-label="Collection options"
      onClick={(e) => e.stopPropagation()}
    >
      <MoreVertical size={16} />
    </button>
  );

  const folderColor = node.color || '#38bdf8';

  return (
    <motion.div layout variants={childItemVariants} className={styles.treeItem}>
      {/* Folder Header Row */}
      <div
        className={`${styles.itemRow} ${depth > 0 ? styles.subfolderRow : styles.rootFolderRow}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.itemLeft}>
          <button
            className={styles.expandBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {hasContent ? (
              <motion.span
                className={styles.chevronMotion}
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <ChevronRight size={16} />
              </motion.span>
            ) : (
              <span className={styles.emptyPlaceholder} />
            )}
          </button>

          <div className={styles.folderIconWrapper}>
            {isExpanded ? (
              <FolderOpen size={18} style={{ color: folderColor }} />
            ) : (
              <Folder size={18} style={{ color: folderColor }} />
            )}
          </div>

          <span
            className={styles.itemTitle}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/collections/${node.id}`);
            }}
            title="Open collection"
          >
            {node.name}
          </span>

          <span className={styles.itemBadge}>
            {nodeBookmarks.length} {nodeBookmarks.length === 1 ? 'link' : 'links'}
          </span>
        </div>

        <div className={styles.itemRight}>
          {node.isPublic && (
            <span title="Public Collection" className={styles.publicTag}>
              <Globe size={13} />
            </span>
          )}
          <div className={styles.hoverAction}>
            <Dropdown trigger={triggerBtn} items={menuItems} align="right" />
          </div>
        </div>
      </div>

      {/* Smooth AnimatePresence for recursive sub-folders and bookmarks */}
      <AnimatePresence initial={false}>
        {isExpanded && hasContent && (
          <motion.div
            key="tree-content"
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className={styles.childrenContainer}
          >
            {/* 1. Sub-collections */}
            {childCollections.map((child) => (
              <CollectionTreeNode
                key={child.id}
                node={child}
                bookmarksByCollection={bookmarksByCollection}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSubCollection={onAddSubCollection}
                onShare={onShare}
                depth={depth + 1}
              />
            ))}

            {/* 2. Direct Bookmarks / Links with Dynamic Favicons */}
            {nodeBookmarks.map((b) => (
              <BookmarkTreeItem key={b.id} bookmark={b} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CollectionTree: React.FC<CollectionTreeProps> = ({
  collections,
  bookmarks = [],
  onEdit,
  onDelete,
  onAddSubCollection,
  onShare,
}) => {
  // Map bookmarks by collectionId
  const bookmarksByCollection = useMemo(() => {
    const map = new Map<string, Bookmark[]>();
    bookmarks.forEach((b) => {
      if (b.collectionId) {
        const list = map.get(b.collectionId) || [];
        list.push(b);
        map.set(b.collectionId, list);
      }
    });
    return map;
  }, [bookmarks]);

  // Build tree hierarchy
  const treeNodes = useMemo(() => {
    const map = new Map<string, Collection>();
    const roots: Collection[] = [];

    collections.forEach((c) => {
      map.set(c.id, { ...c, children: [] });
    });

    collections.forEach((c) => {
      const current = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children!.push(current);
      } else {
        roots.push(current);
      }
    });

    return roots;
  }, [collections]);

  return (
    <motion.div layout className={styles.treeContainer}>
      {treeNodes.map((root) => (
        <CollectionTreeNode
          key={root.id}
          node={root}
          bookmarksByCollection={bookmarksByCollection}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubCollection={onAddSubCollection}
          onShare={onShare}
          depth={0}
        />
      ))}
    </motion.div>
  );
};
