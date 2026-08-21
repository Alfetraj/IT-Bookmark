import React from 'react';
import { Button } from '../button/button';
import styles from './ErrorState.module.scss';

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Something went wrong',
    message,
    onRetry,
    className = ''
}) => {
    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.iconWrapper}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.message}>{message}</p>
            {onRetry && (
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onRetry}>Try Again</Button>
                </div>
            )}
        </div>
    );
};