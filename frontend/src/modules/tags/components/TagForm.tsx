import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tagSchema, type TagFormValues } from '../schemas/tag.schema';
import type { Tag } from '../types/tag.types';
import { Modal } from '../../../components/ui/modal/Modal';
import { Input } from '../../../components/ui/input/input';
import { Button } from '../../../components/ui/button/button';
import styles from '../styles/TagForm.module.scss';

interface TagFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TagFormValues) => void;
  initialData?: Tag | null;
  isLoading?: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const TagForm: React.FC<TagFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      color: COLORS[0],
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          color: initialData.color || COLORS[0],
        });
      } else {
        reset({
          name: '',
          color: COLORS[0],
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
      <Button variant="ghost" onClick={onClose} disabled={isLoading} type="button">
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isLoading} type="button">
        {initialData ? 'Update Tag' : 'Create Tag'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Tag' : 'New Tag'}
      maxWidth="sm"
      footer={footer}
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Tag Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="E.g., kubernetes, terraform, react"
          autoFocus
        />

        <div className={styles.colorPicker}>
          <span className={styles.colorLabel}>Badge Color</span>
          <div className={styles.colorOptions}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.colorBtn} ${selectedColor === c ? styles.selected : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setValue('color', c)}
                aria-label={`Select tag color ${c}`}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};
