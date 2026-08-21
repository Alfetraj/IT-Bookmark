import React from 'react';
import { EmptyState } from '../../../components/ui/emptyState/emptyState';
import { Button } from '../../../components/ui/button/button';

interface EmptyTagsProps {
  onCreateClick: () => void;
}

export const EmptyTags: React.FC<EmptyTagsProps> = ({ onCreateClick }) => {
  return (
    <EmptyState
      title="No Tags Yet"
      description="Create tags to organize your IT resources by topic, tech stack, or environment."
      icon="🏷️"
      action={
        <Button variant="primary" onClick={onCreateClick}>
          + Create Your First Tag
        </Button>
      }
    />
  );
};
