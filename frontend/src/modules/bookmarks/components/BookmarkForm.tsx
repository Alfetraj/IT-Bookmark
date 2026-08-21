import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookmarkSchema, type BookmarkFormValues } from '../schemas/bookmark.schema';
import type { Bookmark } from '../types/bookmark.types';
import type { Collection } from '../../collections/types/collection.types';
import type { Tag } from '../../tags/types/tag.types';
import { Modal } from '../../../components/ui/modal/Modal';
import { Input } from '../../../components/ui/input/input';
import { Button } from '../../../components/ui/button/button';
import styles from '../styles/BookmarkForm.module.scss';

interface BookmarkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookmarkFormValues) => void;
  initialData?: Bookmark | null;
  collections: Collection[];
  tags: Tag[];
  isLoading?: boolean;
}

export const BookmarkForm: React.FC<BookmarkFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  collections,
  tags,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookmarkFormValues>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: {
      url: '',
      title: '',
      description: '',
      notes: '',
      collectionId: null,
      tagIds: [],
      isFavorite: false,
      readLater: false,
    },
  });

  const selectedTagIds = watch('tagIds') || [];
  const isFavorite = watch('isFavorite');
  const readLater = watch('readLater');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          url: initialData.url,
          title: initialData.title,
          description: initialData.description || '',
          notes: initialData.notes || '',
          collectionId: initialData.collectionId || null,
          tagIds: initialData.tags.map((t) => t.id),
          isFavorite: initialData.isFavorite,
          readLater: initialData.readLater,
        });
      } else {
        reset({
          url: '',
          title: '',
          description: '',
          notes: '',
          collectionId: null,
          tagIds: [],
          isFavorite: false,
          readLater: false,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleTagToggle = (tagId: string) => {
    const current = selectedTagIds || [];
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    setValue('tagIds', updated);
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
      <Button variant="ghost" onClick={onClose} disabled={isLoading} type="button">
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isLoading} type="button">
        {initialData ? 'Update Bookmark' : 'Save Bookmark'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Bookmark' : 'Add Bookmark'}
      maxWidth="md"
      footer={footer}
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="URL"
          {...register('url')}
          error={errors.url?.message}
          placeholder="https://docs.docker.com/get-started/"
          autoFocus
        />

        <Input
          label="Title (optional)"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Docker Getting Started Guide"
        />

        <div className={styles.row}>
          <div className={styles.selectField}>
            <label className={styles.selectLabel}>Collection</label>
            <select
              className={styles.selectInput}
              {...register('collectionId')}
              defaultValue=""
            >
              <option value="">None</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.textareaField}>
            <label className={styles.textareaLabel}>Description</label>
            <textarea
              className={styles.textarea}
              {...register('description')}
              placeholder="Brief description..."
              rows={2}
            />
          </div>
        </div>

        <div className={styles.textareaField}>
          <label className={styles.textareaLabel}>Notes</label>
          <textarea
            className={styles.textarea}
            {...register('notes')}
            placeholder="Personal notes about this resource..."
            rows={3}
          />
        </div>

        {tags.length > 0 && (
          <div className={styles.tagSelector}>
            <span className={styles.tagSelectorLabel}>Tags</span>
            <div className={styles.tagChips}>
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`${styles.tagChip} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    <span
                      className={styles.tagDot}
                      style={{ backgroundColor: isSelected ? '#ffffff' : (tag.color || '#3b82f6') }}
                    />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.toggleRow}>
          <label className={styles.toggleItem}>
            <input
              type="checkbox"
              className={styles.toggleCheckbox}
              checked={isFavorite || false}
              onChange={(e) => setValue('isFavorite', e.target.checked)}
            />
            ⭐ Favorite
          </label>
          <label className={styles.toggleItem}>
            <input
              type="checkbox"
              className={styles.toggleCheckbox}
              checked={readLater || false}
              onChange={(e) => setValue('readLater', e.target.checked)}
            />
            🕐 Read Later
          </label>
        </div>
      </form>
    </Modal>
  );
};
