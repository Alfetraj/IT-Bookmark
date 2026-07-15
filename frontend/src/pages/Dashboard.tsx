import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome back, {user?.name || user?.email || 'User'}</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Here is an overview of your bookmarks and collections.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="glass-card" style={{ marginTop: 0 }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Total Bookmarks</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>0</p>
        </div>
        <div className="glass-card" style={{ marginTop: 0 }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Collections</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>0</p>
        </div>
        <div className="glass-card" style={{ marginTop: 0 }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Tags</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>0</p>
        </div>
      </div>

      <div className="glass-card">
        <h2>Phase 3 Implementation</h2>
        <p>The Core Dashboard & Layout module is active.</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
          <li>Secure routing established.</li>
          <li>Sidebar navigation implemented.</li>
          <li>Dark / Light theme toggling is fully operational via CSS variables.</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
