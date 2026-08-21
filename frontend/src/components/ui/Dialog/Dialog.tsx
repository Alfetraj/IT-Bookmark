import React from 'react';
import { Modal } from '../modal/Modal';
import { Button } from '../button/button';
import styles from './Dialog.module.scss';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary';
    isLoading?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'primary',
    isLoading = false
}) => {
    const footer = (
        <div className={styles.footer}>
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                {cancelLabel}
            </Button>
            <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
                {confirmLabel}
            </Button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" title={title} footer={footer}>
            <p className={styles.description}>{description}</p>
        </Modal>
    );
};