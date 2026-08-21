import React from 'react';
import { EmptyState } from '../../../components/ui/emptyState/emptyState';
import { Button } from '../../../components/ui/button/button';

interface EmptyBookmarksProps {
  onCreateClick: () => void;
}

export const EmptyBookmarks: React.FC<EmptyBookmarksProps> = ({ onCreateClick }) => {
  return (
    <EmptyState
      title="No Bookmarks Yet"
      description="Start saving your IT resources, documentation links, and dev tools to organize them efficiently."
      icon="🔖"
      action={
        <Button variant="primary" onClick={onCreateClick}>
          + Add Your First Bookmark
        </Button>
      }
    />
  );
};
