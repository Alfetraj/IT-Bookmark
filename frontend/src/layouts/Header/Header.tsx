import React from 'react';
import { Avatar } from '../../components/ui/Avatar/Avatar';
import { Dropdown } from '../../components/ui/Dropdown/Dropdown';
import styles from './Header.module.scss';

interface HeaderProps {
    userName?: string;
    userEmail?: string;
    onMenuToggle: () => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    userName = 'User',
    userEmail = '',
    onMenuToggle,
    onLogout
}) => {
    const userMenu = [
        { label: 'Profile Settings', onClick: () => console.log('Navigate to settings') },
        { label: 'Sign out', onClick: onLogout, danger: true }
    ];

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <button className={styles.menuToggle} onClick={onMenuToggle} aria-label="Toggle menu">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className={styles.brand}>
                    <span className={styles.brandIcon}>🔖</span>
                    <span className={styles.brandName}>IT Bookmark</span>
                </div>
            </div>

            <div className={styles.right}>
                <span style={{ display: 'none' }}>{userEmail}</span>
                <Dropdown
                    align="right"
                    trigger={<Avatar name={userName} size="sm" />}
                    items={userMenu}
                />
            </div>
        </header>
    );
};