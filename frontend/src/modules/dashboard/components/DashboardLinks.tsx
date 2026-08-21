import React from 'react';
import type { Bookmark } from '../../bookmarks/types/bookmark.types';
import { BookmarkCard } from '../../bookmarks/components/BookmarkCard';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button/button';

interface DashboardLinksProps {
  links: Bookmark[];
  emptyMessage?: string;
  emptySubMessage?: string;
}

export const DashboardLinks: React.FC<DashboardLinksProps> = ({ 
  links, 
  emptyMessage = "No links found.",
  emptySubMessage = ""
}) => {
  const navigate = useNavigate();

  if (!links || links.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        minHeight: '16rem',
        gap: '0.5rem',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 400 }}>{emptyMessage}</h3>
        {emptySubMessage && <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{emptySubMessage}</p>}
        <div style={{ marginTop: '1rem' }}>
          <Button variant="primary" onClick={() => navigate('/bookmarks')}>
            Manage Bookmarks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    }}>
      {links.map((link) => (
        <BookmarkCard
          key={link.id}
          bookmark={link}
          onEdit={() => navigate(`/bookmarks/${link.id}`)}
          onDelete={() => {}}
          onToggleFavorite={() => {}}
          onToggleReadLater={() => {}}
        />
      ))}
    </div>
  );
};
