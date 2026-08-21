import React, { useState, useMemo } from 'react';
import { useBookmarks } from '../modules/bookmarks/hooks/useBookmarks';
import { useTags } from '../modules/tags/hooks/useTags';
import { useCollections } from '../modules/collections/hooks/useCollections';
import { BookmarkHeader } from '../modules/bookmarks/components/BookmarkHeader';
import { BookmarkCard } from '../modules/bookmarks/components/BookmarkCard';
import { BookmarkForm } from '../modules/bookmarks/components/BookmarkForm';
import { EmptyBookmarks } from '../modules/bookmarks/components/EmptyBookmarks';
import type { Bookmark } from '../modules/bookmarks/types/bookmark.types';
import type { BookmarkFormValues } from '../modules/bookmarks/schemas/bookmark.schema';
import { Dialog } from '../components/ui/Dialog/Dialog';
import { Toast, type ToastProps } from '../components/ui/Toast/Toast';

const Bookmarks: React.FC = () => {
  const {
    bookmarks,
    isLoading,
    error,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    toggleFavorite,
    toggleReadLater,
    isCreating,
    isUpdating,
    isDeleting,
  } = useBookmarks();

  const { tags } = useTags();
  const { collections } = useCollections();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, title }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateClick = () => {
    setSelectedBookmark(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (bookmark: Bookmark) => {
    setBookmarkToDelete(bookmark);
  };

  const handleToggleFavorite = async (bookmark: Bookmark) => {
    try {
      await toggleFavorite({ id: bookmark.id, isFavorite: !bookmark.isFavorite });
      addToast(
        bookmark.isFavorite ? 'Removed from favorites' : 'Added to favorites',
        'success'
      );
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Failed to update favorite status', 'error');
    }
  };

  const handleToggleReadLater = async (bookmark: Bookmark) => {
    try {
      await toggleReadLater({ id: bookmark.id, readLater: !bookmark.readLater });
      addToast(
        bookmark.readLater ? 'Removed from read later' : 'Added to read later',
        'success'
      );
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Failed to update read later status', 'error');
    }
  };

  const handleFormSubmit = async (data: BookmarkFormValues) => {
    try {
      if (selectedBookmark) {
        await updateBookmark({ id: selectedBookmark.id, data });
        addToast('Bookmark updated successfully', 'success');
      } else {
        await createBookmark(data);
        addToast('Bookmark saved successfully', 'success');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      console.error('Failed to save bookmark:', err);
      addToast(err?.response?.data?.error || err?.message || 'Failed to save bookmark', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (bookmarkToDelete) {
      try {
        await deleteBookmark(bookmarkToDelete.id);
        addToast(`Bookmark "${bookmarkToDelete.title}" deleted`, 'success');
        setBookmarkToDelete(null);
      } catch (err: any) {
        console.error('Failed to delete bookmark:', err);
        addToast(err?.response?.data?.error || err?.message || 'Failed to delete bookmark', 'error');
      }
    }
  };

  const filteredBookmarks = useMemo(() => {
    let result = bookmarks;

    // Apply filter
    if (activeFilter === 'favorites') {
      result = result.filter((b) => b.isFavorite);
    } else if (activeFilter === 'readLater') {
      result = result.filter((b) => b.readLater);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          b.domain.toLowerCase().includes(query) ||
          (b.description && b.description.toLowerCase().includes(query)) ||
          (b.notes && b.notes.toLowerCase().includes(query)) ||
          b.tags.some((t) => t.name.toLowerCase().includes(query))
      );
    }

    return result;
  }, [bookmarks, searchQuery, activeFilter]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredBookmarks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBookmarks.map((b) => b.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const { bulkOperation, isBulking } = useBookmarks();

  const [bulkActionToConfirm, setBulkActionToConfirm] = useState<string | null>(null);

  const handleBulkAction = async (action: string) => {
    if (action === 'delete') {
      setBulkActionToConfirm('delete');
      return;
    }

    try {
      const result = await bulkOperation({ bookmarkIds: Array.from(selectedIds), action });
      addToast(`Bulk action successful: ${result.succeeded} updated`, 'success');
      setSelectedIds(new Set());
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Bulk operation failed', 'error');
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const result = await bulkOperation({ bookmarkIds: Array.from(selectedIds), action: 'delete' });
      addToast(`Deleted ${result.succeeded} bookmarks`, 'success');
      setSelectedIds(new Set());
      setBulkActionToConfirm(null);
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Failed to bulk delete', 'error');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading bookmarks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <h3>Failed to load bookmarks</h3>
        <p>Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div>
      {bookmarks.length > 0 ? (
        <>
          <BookmarkHeader
            onCreateClick={handleCreateClick}
            bookmarkCount={bookmarks.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            selectedCount={selectedIds.size}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onBulkAction={handleBulkAction}
          />

          {filteredBookmarks.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1rem',
              }}
            >
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleReadLater={handleToggleReadLater}
                  isSelected={selectedIds.has(bookmark.id)}
                  onSelect={handleSelect}
                  isSelectionMode={selectedIds.size > 0}
                />
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>
                {activeFilter !== 'all'
                  ? `No ${activeFilter === 'favorites' ? 'favorite' : 'read later'} bookmarks found.`
                  : `No bookmarks matching "${searchQuery}"`}
              </p>
            </div>
          )}
        </>
      ) : (
        <EmptyBookmarks onCreateClick={handleCreateClick} />
      )}

      <BookmarkForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedBookmark}
        collections={collections}
        tags={tags}
        isLoading={isCreating || isUpdating}
      />

      <Dialog
        isOpen={!!bookmarkToDelete}
        onClose={() => setBookmarkToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Bookmark"
        description={`Are you sure you want to delete "${bookmarkToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      <Dialog
        isOpen={!!bulkActionToConfirm}
        onClose={() => setBulkActionToConfirm(null)}
        onConfirm={confirmBulkDelete}
        title="Bulk Delete"
        description={`Are you sure you want to delete ${selectedIds.size} bookmarks? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        isLoading={isBulking}
      />

      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
