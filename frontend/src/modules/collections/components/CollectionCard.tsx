import React from 'react';
import { motion } from 'framer-motion';
import type { Collection } from '../types/collection.types';
import { Dropdown } from '../../../components/ui/Dropdown/Dropdown';
import { Avatar } from '../../../components/ui/Avatar/Avatar';
import { MoreHorizontal, Edit2, Trash2, Globe, Link2, Calendar, UserPlus } from 'lucide-react';
import styles from '../styles/CollectionCard.module.scss';
import { useNavigate } from 'react-router-dom';

interface CollectionCardProps {
  collection: Collection;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onShare: (collection: Collection) => void;
}

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onEdit,
  onDelete,
  onShare,
}) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: 'Share & Collaborate',
      icon: <UserPlus size={14} />,
      onClick: () => {
        onShare(collection);
      },
    },
    {
      label: 'Edit Collection',
      icon: <Edit2 size={14} />,
      onClick: () => {
        onEdit(collection);
      },
    },
    {
      label: 'Delete Collection',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => {
        onDelete(collection);
      },
    },
  ];

  const triggerBtn = (
    <motion.button
      className={styles.menuBtn}
      aria-label="Collection options"
      onClick={(e) => e.stopPropagation()}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <MoreHorizontal size={18} />
    </motion.button>
  );

  const formattedDate = new Date(collection.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const baseColor = collection.color || '#38bdf8';
  const gradientStyle = {
    backgroundImage: `linear-gradient(45deg, ${baseColor}30 0%, var(--bg-card) 50%, var(--bg-card) 100%)`,
  };

  const members = collection.members || [];
  const owner = collection.owner;
  const displayedMembers = members.slice(0, 3);
  const extraMembersCount = members.length > 3 ? members.length - 3 : 0;

  return (
    <motion.div
      className={styles.cardWrapper}
      variants={cardItemVariants}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 22,
      }}
    >
      {/* Dropdown Options Button */}
      <div className={styles.dropdownContainer}>
        <Dropdown trigger={triggerBtn} items={menuItems} align="right" />
      </div>

      {/* Main Clickable Card */}
      <div
        className={styles.card}
        style={gradientStyle}
        onClick={() => navigate(`/collections/${collection.id}`)}
        role="button"
        tabIndex={0}
      >
        <div className={styles.header}>
          <p className={styles.title} title={collection.name}>
            {collection.name}
          </p>
        </div>

        <div className={styles.spacer} />

        <div className={styles.footer}>
          {/* Bottom Left: Owner and Member Avatars */}
          <motion.div
            className={styles.avatarsGroup}
            onClick={(e) => {
              e.stopPropagation();
              onShare(collection);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            title="Manage sharing & members"
          >
            {owner && (
              <Avatar
                size="md"
                name={owner.name}
                email={owner.email}
                src={owner.avatar}
                className={styles.ownerAvatar}
              />
            )}
            {displayedMembers.map((m, idx) => (
              <Avatar
                key={m.id || idx}
                size="md"
                name={m.user?.name}
                email={m.user?.email}
                src={m.user?.avatar}
                className={styles.memberAvatar}
              />
            ))}
            {extraMembersCount > 0 && (
              <div className={styles.extraBadge} title={`${extraMembersCount} more members`}>
                <span>+{extraMembersCount}</span>
              </div>
            )}
          </motion.div>

          {/* Bottom Right: Stats & Date */}
          <div className={styles.footerRight}>
            <div className={styles.statsRow}>
              {collection.isPublic && (
                <span title="Collection publicly shared" className={styles.publicIconWrapper}>
                  <Globe size={14} className={styles.publicIcon} />
                </span>
              )}
              <span title="Bookmarks" className={styles.linkIconWrapper}>
                <Link2 size={15} />
              </span>
              <span className={styles.countText}>{collection.bookmarkCount || 0}</span>
            </div>

            <div className={styles.dateRow}>
              <span title="Created at" className={styles.calendarIconWrapper}>
                <Calendar size={12} />
              </span>
              <span className={styles.dateText}>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
