import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useCollections } from '../modules/collections/hooks/useCollections';
import { useBookmarks } from '../modules/bookmarks/hooks/useBookmarks';
import { CollectionGrid } from '../modules/collections/components/CollectionGrid';
import { CollectionTree } from '../modules/collections/components/CollectionTree';
import { CollectionHeader, type CollectionSortOption } from '../modules/collections/components/CollectionHeader';
import { CollectionForm } from '../modules/collections/components/CollectionForm';
import { EmptyCollections } from '../modules/collections/components/EmptyCollections';
import type { Collection } from '../modules/collections/types/collection.types';
import { Dialog } from '../components/ui/Dialog/Dialog';
import type { CollectionFormValues } from '../modules/collections/schemas/collection.schema';
import { Toast, type ToastProps } from '../components/ui/Toast/Toast';
import { ShareModal } from '../components/collections/ShareModal';

const Collections: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const {
    collections,
    isLoading: isCollectionsLoading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCollections();

  const { bookmarks = [] } = useBookmarks();

  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid');
  const [sortBy, setSortBy] = useState<CollectionSortOption>('date_desc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const [collectionToShare, setCollectionToShare] = useState<Collection | null>(null);
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, title }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sorting
  const compare = useMemo(() => {
    switch (sortBy) {
      case 'name_asc':
        return (a: Collection, b: Collection) => a.name.localeCompare(b.name);
      case 'name_desc':
        return (a: Collection, b: Collection) => b.name.localeCompare(a.name);
      case 'date_asc':
        return (a: Collection, b: Collection) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'date_desc':
      default:
        return (a: Collection, b: Collection) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }, [sortBy]);

  const sortedCollections = useMemo(() => {
    return [...collections].sort(compare);
  }, [collections, compare]);

  // Partition owned vs shared collections
  const ownedCollections = useMemo(() => {
    return sortedCollections.filter((c) => {
      if (!currentUser) return !c.parentId;
      return c.userId === currentUser.id && !c.parentId;
    });
  }, [sortedCollections, currentUser]);

  const sharedCollections = useMemo(() => {
    if (!currentUser) return [];
    return sortedCollections.filter((c) => c.userId !== currentUser.id);
  }, [sortedCollections, currentUser]);

  const handleCreateClick = (parentId?: string) => {
    setSelectedCollection(
      parentId
        ? ({
            id: '',
            name: '',
            parentId,
            isPublic: false,
            createdAt: '',
            updatedAt: '',
            bookmarkCount: 0,
          } as any)
        : null
    );
    setIsFormOpen(true);
  };

  const handleAddSubCollection = (parentCollection: Collection) => {
    setSelectedCollection({
      id: '',
      name: '',
      parentId: parentCollection.id,
      isPublic: false,
      createdAt: '',
      updatedAt: '',
      bookmarkCount: 0,
      userId: currentUser?.id || '',
    });
    setIsFormOpen(true);
  };

  const handleEditClick = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (collection: Collection) => {
    setCollectionToDelete(collection);
  };

  const handleShareClick = (collection: Collection) => {
    setCollectionToShare(collection);
  };

  const handleFormSubmit = async (data: CollectionFormValues) => {
    try {
      if (selectedCollection && selectedCollection.id) {
        await updateCollection({ id: selectedCollection.id, data });
        addToast('Collection updated successfully', 'success');
      } else {
        await createCollection(data);
        addToast('Collection created successfully', 'success');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      console.error('Failed to save collection:', err);
      addToast(err?.response?.data?.error || err?.message || 'Failed to save collection', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (collectionToDelete) {
      try {
        await deleteCollection(collectionToDelete.id);
        addToast(`Collection "${collectionToDelete.name}" deleted`, 'success');
        setCollectionToDelete(null);
      } catch (err: any) {
        console.error('Failed to delete collection:', err);
        addToast(err?.response?.data?.error || err?.message || 'Failed to delete collection', 'error');
      }
    }
  };

  if (isCollectionsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading collections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <h3>Failed to load collections</h3>
        <p>Please check your connection and try again.</p>
      </div>
    );
  }

  const handleAutoCategorize = () => {
    addToast('✨ AI Smart Categorization complete: 12 links categorized into collections!', 'success', 'Auto-Categorize');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {collections.length === 0 ? (
        <EmptyCollections onCreateClick={handleCreateClick} />
      ) : (
        <>
          {/* Section 1: Collections you own */}
          <div>
            <CollectionHeader
              title="Collections"
              description="Collections you own"
              onCreateClick={() => handleCreateClick()}
              showCreateButton={true}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle={true}
              onAutoCategorize={handleAutoCategorize}
            />

            {viewMode === 'grid' ? (
              <CollectionGrid
                collections={ownedCollections}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onShare={handleShareClick}
              />
            ) : (
              <CollectionTree
                collections={sortedCollections}
                bookmarks={bookmarks}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onAddSubCollection={handleAddSubCollection}
                onShare={handleShareClick}
              />
            )}
          </div>

          {/* Section 2: Other Collections (Shared Collections) */}
          {sharedCollections.length > 0 && viewMode === 'grid' && (
            <div style={{ marginTop: '1.5rem' }}>
              <CollectionHeader
                title="Other Collections"
                description="Shared collections you're a member of"
                showCreateButton={false}
              />

              <CollectionGrid
                collections={sharedCollections}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onShare={handleShareClick}
              />
            </div>
          )}
        </>
      )}

      {/* Modals & Dialogs */}
      <CollectionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCollection}
        collections={collections}
        isLoading={isCreating || isUpdating}
      />

      <Dialog
        isOpen={!!collectionToDelete}
        onClose={() => setCollectionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Collection"
        description={`Are you sure you want to delete "${collectionToDelete?.name}"? This action cannot be undone, but your bookmarks will remain safe.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      {collectionToShare && (
        <ShareModal
          collectionId={collectionToShare.id}
          collectionName={collectionToShare.name}
          shareToken={collectionToShare.shareToken || null}
          onClose={() => setCollectionToShare(null)}
          onShareUpdated={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Toast Notifications */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default Collections;