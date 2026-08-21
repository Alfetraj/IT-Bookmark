import React from 'react';
import styles from './Badge.module.scss';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'info' | 'success' | 'warning' | 'error' | 'default';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
    return (
        <span className={`${styles.badge} ${styles[`variant-${variant}`]} ${className}`}>
            {children}
        </span>
    );
};