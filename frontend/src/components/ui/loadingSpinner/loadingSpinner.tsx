import React from 'react';
import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
    return (
        <div className={`${styles.spinner} ${styles[`size-${size}`]} ${className}`} role="status">
            <span className={styles.visuallyHidden}>Loading...</span>
        </div>
    );
};