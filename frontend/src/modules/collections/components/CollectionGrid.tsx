import React from 'react';
import { motion } from 'framer-motion';
import type { Collection } from '../types/collection.types';
import { CollectionCard } from './CollectionCard';
import styles from '../styles/CollectionGrid.module.scss';

interface CollectionGridProps {
  collections: Collection[];
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onShare: (collection: Collection) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const CollectionGrid: React.FC<CollectionGridProps> = ({
  collections,
  onEdit,
  onDelete,
  onShare,
}) => {
  return (
    <motion.div
      className={styles.grid}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onEdit={onEdit}
          onDelete={onDelete}
          onShare={onShare}
        />
      ))}
    </motion.div>
  );
};
