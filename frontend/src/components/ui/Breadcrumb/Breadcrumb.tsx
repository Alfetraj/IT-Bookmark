import React from 'react';
import styles from './Breadcrumb.module.scss';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
    return (
        <nav aria-label="Breadcrumb" className={`${styles.nav} ${className}`}>
            <ol className={styles.list}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} className={styles.item}>
                            {item.href && !isLast ? (
                                <a href={item.href} className={styles.link}>
                                    {item.label}
                                </a>
                            ) : (
                                <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                                    {item.label}
                                </span>
                            )}
                            {!isLast && <span className={styles.separator}>/</span>}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
