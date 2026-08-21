import React from 'react';
import styles from './Sidebar.module.scss';

export interface NavItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
    isActive?: boolean;
}

interface SidebarProps {
    items: NavItem[];
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, isOpen, onClose }) => {
    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && <div className={styles.backdrop} onClick={onClose} />}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <nav className={styles.nav}>
                    <ul className={styles.list}>
                        {items.map((item, idx) => (
                            <li key={idx}>
                                <a
                                    href={item.href}
                                    className={`${styles.link} ${item.isActive ? styles.active : ''}`}
                                >
                                    {item.icon && <span className={styles.icon}>{item.icon}</span>}
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};