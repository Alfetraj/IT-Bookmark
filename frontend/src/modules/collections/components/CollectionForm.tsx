import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collectionSchema, type CollectionFormValues } from '../schemas/collection.schema';
import type { Collection } from '../types/collection.types';
import { Modal } from '../../../components/ui/modal/Modal';
import { Input } from '../../../components/ui/input/input';
import { Button } from '../../../components/ui/button/button';
import styles from '../styles/CollectionForm.module.scss';

interface CollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CollectionFormValues) => void;
  initialData?: Collection | null;
  collections?: Collection[];
  isLoading?: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#64748b', // slate
];

export const CollectionForm: React.FC<CollectionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  collections = [],
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: false,
      parentId: null,
      color: COLORS[0],
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description || '',
          isPublic: initialData.isPublic ?? false,
          parentId: initialData.parentId || null,
          color: initialData.color || COLORS[0],
        });
      } else {
        reset({
          name: '',
          description: '',
          isPublic: false,
          parentId: null,
          color: COLORS[0],
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const validParentOptions = useMemo(() => {
    if (!initialData) return collections;
    return collections.filter((c) => c.id !== initialData.id && c.parentId !== initialData.id);
  }, [collections, initialData]);

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
      <Button variant="ghost" onClick={onClose} disabled={isLoading} type="button">
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isLoading} type="button">
        {initialData ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Collection' : 'New Collection'}
      maxWidth="md"
      footer={footer}
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="E.g., Work Resources"
          autoFocus
        />

        <Input
          label="Description (optional)"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Briefly describe this collection"
        />

        <div className={styles.selectGroup}>
          <label className={styles.selectLabel} htmlFor="parent-collection-select">
            Parent Collection (optional)
          </label>
          <select
            id="parent-collection-select"
            className={styles.selectInput}
            {...register('parentId')}
            onChange={(e) => setValue('parentId', e.target.value || null)}
          >
            <option value="">None (Root Collection)</option>
            {validParentOptions.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.colorPicker}>
          <span className={styles.colorLabel}>Color</span>
          <div className={styles.colorOptions}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.colorBtn} ${selectedColor === c ? styles.selected : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setValue('color', c)}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <label className={styles.checkbox}>
          <input type="checkbox" {...register('isPublic')} />
          Make this collection public
        </label>
      </form>
    </Modal>
  );
};
