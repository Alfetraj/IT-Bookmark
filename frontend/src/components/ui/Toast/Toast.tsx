import React, { useEffect } from 'react';
import styles from './Toast.module.scss';

export interface ToastProps {
    id: string;
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    onClose: (id: string) => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    id,
    title,
    message,
    type = 'info',
    onClose,
    duration = 3000
}) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => onClose(id), duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    return (
        <div className={`${styles.toast} ${styles[`type-${type}`]}`} role="alert">
            <div className={styles.content}>
                {title && <h4 className={styles.title}>{title}</h4>}
                <p className={styles.message}>{message}</p>
            </div>
            <button className={styles.closeBtn} onClick={() => onClose(id)} aria-label="Close">
                &times;
            </button>
        </div>
    );
};