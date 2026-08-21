import React, { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.scss';

interface ContextMenuItem {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    danger?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Use mousedown to close immediately on click away
        document.addEventListener('mousedown', handleClickOutside);
        // Prevent default context menu from overriding ours if triggered inside the menu
        const handleContext = (e: MouseEvent) => e.preventDefault();
        menuRef.current?.addEventListener('contextmenu', handleContext);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            menuRef.current?.removeEventListener('contextmenu', handleContext);
        };
    }, [onClose]);

    return (
        <div
            className={styles.menu}
            ref={menuRef}
            style={{ top: y, left: x }}
            role="menu"
        >
            {items.map((item, index) => (
                <button
                    key={index}
                    className={`${styles.item} ${item.danger ? styles.danger : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        item.onClick();
                        onClose();
                    }}
                    role="menuitem"
                >
                    {item.icon && <span className={styles.icon}>{item.icon}</span>}
                    {item.label}
                </button>
            ))}
        </div>
    );
};
