import React from 'react';
import { EmptyState } from '../../../components/ui/emptyState/emptyState';
import { Button } from '../../../components/ui/button/button';

interface EmptyCollectionsProps {
  onCreateClick: () => void;
}

export const EmptyCollections: React.FC<EmptyCollectionsProps> = ({ onCreateClick }) => {
  return (
    <EmptyState
      title="No Collections Yet"
      description="Create your first collection to start organizing your bookmarks into custom folders."
      icon="📁"
      action={
        <Button variant="primary" onClick={onCreateClick}>
          Create Collection
        </Button>
      }
    />
  );
};
