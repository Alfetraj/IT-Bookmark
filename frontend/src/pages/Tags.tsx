import React, { useState, useMemo } from 'react';
import { useTags } from '../modules/tags/hooks/useTags';
import { TagHeader } from '../modules/tags/components/TagHeader';
import { TagCard } from '../modules/tags/components/TagCard';
import { TagForm } from '../modules/tags/components/TagForm';
import { EmptyTags } from '../modules/tags/components/EmptyTags';
import type { Tag } from '../modules/tags/types/tag.types';
import { Dialog } from '../components/ui/Dialog/Dialog';
import type { TagFormValues } from '../modules/tags/schemas/tag.schema';
import { Toast, type ToastProps } from '../components/ui/Toast/Toast';

const Tags: React.FC = () => {
  const {
    tags,
    isLoading,
    error,
    createTag,
    updateTag,
    deleteTag,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTags();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, title }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateClick = () => {
    setSelectedTag(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (tag: Tag) => {
    setSelectedTag(tag);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag);
  };

  const handleFormSubmit = async (data: TagFormValues) => {
    try {
      if (selectedTag) {
        await updateTag({ id: selectedTag.id, data });
        addToast('Tag updated successfully', 'success');
      } else {
        await createTag(data);
        addToast('Tag created successfully', 'success');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      console.error('Failed to save tag:', err);
      addToast(err?.response?.data?.error || err?.message || 'Failed to save tag', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (tagToDelete) {
      try {
        await deleteTag(tagToDelete.id);
        addToast(`Tag "#${tagToDelete.name}" deleted`, 'success');
        setTagToDelete(null);
      } catch (err: any) {
        console.error('Failed to delete tag:', err);
        addToast(err?.response?.data?.error || err?.message || 'Failed to delete tag', 'error');
      }
    }
  };

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const query = searchQuery.toLowerCase().trim();
    return tags.filter(
      (t) => t.name.toLowerCase().includes(query) || t.slug.toLowerCase().includes(query)
    );
  }, [tags, searchQuery]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading tags...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <h3>Failed to load tags</h3>
        <p>Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div>
      {tags.length > 0 ? (
        <>
          <TagHeader
            onCreateClick={handleCreateClick}
            tagCount={tags.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {filteredTags.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              {filteredTags.map((tag) => (
                <TagCard
                  key={tag.id}
                  tag={tag}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>No tags matching "{searchQuery}"</p>
            </div>
          )}
        </>
      ) : (
        <EmptyTags onCreateClick={handleCreateClick} />
      )}

      <TagForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTag}
        isLoading={isCreating || isUpdating}
      />

      <Dialog
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Tag"
        description={`Are you sure you want to delete tag "#${tagToDelete?.name}"? Bookmarks associated with this tag will not be deleted.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default Tags;
