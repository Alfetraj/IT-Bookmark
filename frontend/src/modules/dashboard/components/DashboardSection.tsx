import React from 'react';
import type { DashboardSection as SectionType, DashboardData } from '../services/dashboard.service';
import { DashboardLinks } from './DashboardLinks';
import { Bookmark, Folder, Hash, Pin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardSectionProps {
  section: SectionType;
  dashboardData: DashboardData;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ section, dashboardData }) => {
  const navigate = useNavigate();
  const { type } = section;

  if (type === 'STATS') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ marginTop: 0, display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <Bookmark size={20} />
            <span style={{ fontSize: '1rem' }}>Links</span>
          </div>
          <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{dashboardData.stats?.totalBookmarks ?? 0}</p>
        </div>
        
        <div className="glass-card" style={{ marginTop: 0, display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <Folder size={20} />
            <span style={{ fontSize: '1rem' }}>Collections</span>
          </div>
          <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{dashboardData.stats?.totalCollections ?? 0}</p>
        </div>

        <div className="glass-card" style={{ marginTop: 0, display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <Hash size={20} />
            <span style={{ fontSize: '1rem' }}>Tags</span>
          </div>
          <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{dashboardData.stats?.totalTags ?? 0}</p>
        </div>

        <div className="glass-card" style={{ marginTop: 0, display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <Pin size={20} />
            <span style={{ fontSize: '1rem' }}>Pinned</span>
          </div>
          <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{dashboardData.pinnedLinks?.length ?? 0}</p>
        </div>
      </div>
    );
  }

  if (type === 'RECENT_LINKS') {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Recent Links</h3>
          </div>
          <button onClick={() => navigate('/bookmarks')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            View all &rsaquo;
          </button>
        </div>
        <DashboardLinks 
          links={dashboardData.recentLinks} 
          emptyMessage="View your added links here"
          emptySubMessage="When you add links, they will show up here."
        />
      </div>
    );
  }

  if (type === 'PINNED_LINKS') {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pin size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Pinned Links</h3>
          </div>
          <button onClick={() => navigate('/favorites')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            View all &rsaquo;
          </button>
        </div>
        <DashboardLinks 
          links={dashboardData.pinnedLinks}
          emptyMessage="Pin your favorite links here"
          emptySubMessage="Starred links will be pinned to your dashboard."
        />
      </div>
    );
  }

  return null;
};
