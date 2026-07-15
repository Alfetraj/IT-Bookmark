import { Outlet, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState } from '../store/store';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Bookmark, 
  Folder, 
  Tags, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Search
} from 'lucide-react';

const DashboardLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1>
          <Bookmark className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />
          IT Bookmark
        </h1>
        
        <nav className="sidebar-nav" style={{ marginTop: '2rem' }}>
          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/bookmarks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Bookmark size={20} />
            <span>All Bookmarks</span>
          </NavLink>
          <NavLink to="/collections" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Folder size={20} />
            <span>Collections</span>
          </NavLink>
          <NavLink to="/tags" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Tags size={20} />
            <span>Tags</span>
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
          <button 
            onClick={() => dispatch(logout())}
            className="sidebar-link"
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search bookmarks..." 
              className="header-search"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button 
              onClick={toggleTheme}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 500 }}>{user?.name || user?.email || 'User'}</span>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {(user?.name || user?.email || 'U')[0]}
              </div>
            </div>
          </div>
        </header>

        <section className="content-area">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
