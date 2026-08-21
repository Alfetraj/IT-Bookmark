import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './Input.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

        return (
            <div className={`${styles.wrapper} ${className}`}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={`${styles.input} ${error ? styles.hasError : ''}`}
                    {...props}
                />
                {error && <span className={styles.errorText}>{error}</span>}
                {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
            </div>
        );
    }
);
