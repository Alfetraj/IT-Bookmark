import React from 'react';
import styles from './Avatar.module.scss';

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getInitials = (name?: string | null, email?: string | null): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
};

const getAvatarColor = (str?: string | null): string => {
  if (!str) return '#3b82f6';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#14b8a6', '#6366f1', '#d946ef'
  ];
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  email,
  src,
  size = 'md',
  className = '',
}) => {
  const initials = getInitials(name, email);
  const bgColor = getAvatarColor(name || email || 'user');

  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${className}`}
      style={{ backgroundColor: src ? 'transparent' : bgColor }}
      title={name || email || 'User'}
    >
      {src ? (
        <img
          src={src}
          alt={name || email || 'Avatar'}
          className={styles.image}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
};
