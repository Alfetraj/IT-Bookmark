import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import styles from './AutoCategorizeButton.module.scss';

interface AutoCategorizeButtonProps {
  onCategorize?: () => void;
  className?: string;
}

export const AutoCategorizeButton: React.FC<AutoCategorizeButtonProps> = ({
  onCategorize,
  className = '',
}) => {
  const [isCategorizing, setIsCategorizing] = useState(false);

  const handleClick = () => {
    if (isCategorizing) return;
    setIsCategorizing(true);

    setTimeout(() => {
      setIsCategorizing(false);
      if (onCategorize) {
        onCategorize();
      }
    }, 2000);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={isCategorizing}
      className={`${styles.magicBtn} ${isCategorizing ? styles.loading : ''} ${className}`}
      whileHover={!isCategorizing ? { scale: 1.03, y: -1 } : {}}
      whileTap={!isCategorizing ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      title="Auto-organize bookmarks into smart collections using AI"
      aria-label="Magic Auto-Categorize"
    >
      {isCategorizing ? (
        <>
          <Loader2 size={15} className={styles.spinner} />
          <span>✨ Analyzing links...</span>
        </>
      ) : (
        <>
          <Sparkles size={15} className={styles.magicIcon} />
          <span>✨ Auto-Categorize</span>
        </>
      )}
    </motion.button>
  );
};
