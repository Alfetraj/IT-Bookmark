import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/authSlice';
import type { RootState } from '../../store/store';
import { useTheme } from '../../contexts/ThemeContext';
import { Breadcrumb } from '../../components/ui/Breadcrumb/Breadcrumb';
import {
  LayoutDashboard,
  Bookmark,
  Folder,
  Tags,
  Settings,
  LogOut,
  Sun,
  Moon,
  Search,
  Star,
  Clock,
  ArchiveIcon,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Rss,
  Link,
  FolderPlus,
  Tag,
  Upload,
  ChevronDown,
} from 'lucide-react';
import { BookmarkForm } from '../../modules/bookmarks/components/BookmarkForm';
import { CollectionForm } from '../../modules/collections/components/CollectionForm';
import { TagForm } from '../../modules/tags/components/TagForm';
import { UploadModal } from '../../components/ui/UploadModal/UploadModal';
import { useBookmarks } from '../../modules/bookmarks/hooks/useBookmarks';
import { useCollections } from '../../modules/collections/hooks/useCollections';
import { useTags } from '../../modules/tags/hooks/useTags';
import { Toast, type ToastProps } from '../../components/ui/Toast/Toast';
import styles from './DashboardLayout.module.scss';

interface SidebarNavItemProps {
  to: string;
  end?: boolean;
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  onClick: () => void;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  to,
  end,
  icon,
  label,
  isExpanded,
  onClick,
}) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `${styles.sidebarLink} ${isActive ? styles.active : ''} ${!isExpanded ? styles.collapsedLink : ''}`
      }
      title={!isExpanded ? label : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="active-sidebar-indicator"
              className={styles.activeIndicator}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 30,
              }}
            />
          )}
          {icon}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className={styles.linkLabel}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  );
};

const DashboardLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  // Dual-State: Collapsed / Expanded (default: true)
  const [isExpanded, setIsExpanded] = useState(true);

  // Mobile sidebar state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Search query inside sidebar
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Universal Create Dropdown state
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  // Modal open states
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Data hooks for forms
  const { collections, createCollection, isCreating: isCreatingCollection } = useCollections();
  const { tags, createTag, isCreating: isCreatingTag } = useTags();
  const { createBookmark, isCreating: isCreatingBookmark } = useBookmarks();

  // Toast notifications
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, title }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Close create menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [{ label: 'Dashboard' }];

    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      return {
        label: path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' '),
        href: index === paths.length - 1 ? undefined : url,
      };
    });
  }, [location.pathname]);

  const closeMobile = () => setIsMobileOpen(false);

  // Modal Submit Handlers
  const handleBookmarkSubmit = async (data: any) => {
    try {
      await createBookmark(data);
      addToast('Bookmark created successfully', 'success', 'New Link');
      setIsBookmarkModalOpen(false);
    } catch (err: any) {
      console.error('Failed to create bookmark:', err);
      addToast(err?.response?.data?.error || err?.message || 'Failed to create bookmark', 'error');
    }
  };

  const handleCollectionSubmit = async (data: any) => {
    try {
      await createCollection(data);
      addToast('Collection created successfully', 'success', 'New Collection');
      setIsCollectionModalOpen(false);
    } catch (err: any) {
      console.error('Failed to create collection:', err);
      addToast(err?.response?.data?.error || err?.message || 'Failed to create collection', 'error');
    }
  };

  const handleTagSubmit = async (data: any) => {
    try {
      await createTag(data);
      addToast('Tag created successfully', 'success', 'New Tag');
      setIsTagModalOpen(false);
    } catch (err: any) {
      console.error('Failed to create tag:', err);
      addToast(err?.response?.data?.error || err?.message || 'Failed to create tag', 'error');
    }
  };

  const initials = (user?.name || user?.email || 'U')[0].toUpperCase();

  return (
    <div className={styles.appContainer}>
      {/* Mobile Backdrop */}
      {isMobileOpen && <div className={styles.backdrop} onClick={closeMobile} />}

      {/* Dual-State Dark-Themed Sidebar */}
      <motion.aside
        className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}
        animate={{ width: isExpanded ? 256 : 68 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Top Header / Brand Logo */}
        <div className={styles.sidebarHeader}>
          <div className={styles.brandLink}>
            <Bookmark className={styles.brandIcon} size={22} />
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                  className={styles.brandText}
                >
                  IT Bookmark
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button className={styles.closeMenuBtn} onClick={closeMobile} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Quick Search inside Sidebar */}
        <div className={styles.searchSection}>
          {isExpanded ? (
            <div className={styles.sidebarSearchExpanded}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Search..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
              />
            </div>
          ) : (
            <button
              className={styles.sidebarSearchCollapsed}
              onClick={() => setIsExpanded(true)}
              title="Search"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          )}
        </div>

        {/* Universal Create Dropdown Trigger with 3-Second Looping Ambient Glow */}
        <div className={styles.actionWrapper} ref={createMenuRef}>
          <div className={styles.dropdownContainer}>
            {/* The Ambient Glow Layer */}
            <motion.div
              className={styles.ambientGlow}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {isExpanded ? (
              <motion.button
                type="button"
                className={styles.newLinkBtn}
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <div className={styles.btnLeftContent}>
                  <Plus size={18} />
                  <span>Create New</span>
                </div>
                <ChevronDown size={14} />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                className={styles.newLinkBtnCollapsed}
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                title="Create New..."
                aria-label="Create New"
              >
                <Plus size={18} />
              </motion.button>
            )}

            {/* Universal Create Dropdown Menu */}
            <AnimatePresence>
              {isCreateMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className={styles.createMenu}
                >
                  <button
                    className={styles.createMenuItem}
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      setIsBookmarkModalOpen(true);
                    }}
                  >
                    <span className={styles.menuItemIcon}>
                      <Link size={16} />
                    </span>
                    <span>New Link</span>
                  </button>

                  <button
                    className={styles.createMenuItem}
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      setIsCollectionModalOpen(true);
                    }}
                  >
                    <span className={styles.menuItemIcon}>
                      <FolderPlus size={16} />
                    </span>
                    <span>New Collection</span>
                  </button>

                  <button
                    className={styles.createMenuItem}
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      setIsTagModalOpen(true);
                    }}
                  >
                    <span className={styles.menuItemIcon}>
                      <Tag size={16} />
                    </span>
                    <span>New Tag</span>
                  </button>

                  <button
                    className={styles.createMenuItem}
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      setIsUploadModalOpen(true);
                    }}
                  >
                    <span className={styles.menuItemIcon}>
                      <Upload size={16} />
                    </span>
                    <span>Upload File</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className={styles.sidebarNav}>
          <SidebarNavItem
            to="/"
            end
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            isExpanded={isExpanded}
            onClick={closeMobile}
          />
          <SidebarNavItem
            to="/bookmarks"
            icon={<Bookmark size={19} />}
            label="All Bookmarks"
            isExpanded={isExpanded}
            onClick={closeMobile}
          />
          <SidebarNavItem
            to="/collections"
            icon={<Folder size={19} />}
            label="Collections"
            isExpanded={isExpanded}
            onClick={closeMobile}
          />
          <SidebarNavItem
            to="/tags"
            icon={<Tags size={19} />}
            label="Tags"
            isExpanded={isExpanded}
            onClick={closeMobile}
          />
          <SidebarNavItem
            to="/rss"
            icon={<Rss size={19} />}
            label="RSS Feeds"
            isExpanded={isExpanded}
            onClick={closeMobile}
          />

          <div className={styles.navDivider} />

          <SidebarNavItem
            to="/favorites"
            icon={<Star size={19} />}
            label="Favorites"
            isExpanded={isExpanded}
            onClick={closeMobile}
          />
          <SidebarNavItem
            to="/read-later"
            icon={<Clock size={19} />}
            label="Read Later"
            isExpanded={isExpanded}
            onClick={closeMobile}
          />
          <SidebarNavItem
            to="/archive"
            icon={<ArchiveIcon size={19} />}
            label="Archive"
            isExpanded={isExpanded}
            onClick={closeMobile}
          />
        </nav>

        {/* Bottom Section: User Profile & Collapse Toggle */}
        <div className={styles.sidebarFooter}>
          <SidebarNavItem
            to="/settings"
            icon={<Settings size={19} />}
            label="Settings"
            isExpanded={isExpanded}
            onClick={closeMobile}
          />

          <button
            onClick={() => dispatch(logout())}
            className={`${styles.sidebarLink} ${!isExpanded ? styles.collapsedLink : ''}`}
            title={!isExpanded ? 'Sign Out' : undefined}
          >
            <LogOut size={19} />
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                  className={styles.linkLabel}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* User Profile Block + Collapse Button */}
          {isExpanded ? (
            <div className={styles.userProfileRow}>
              <div className={styles.userLeft}>
                <div className={styles.avatarCircle}>{initials}</div>
                <div className={styles.userInfoText}>
                  <span className={styles.userNameText}>{user?.name || user?.email || 'User'}</span>
                  <span className={styles.userEmailText}>{user?.email || ''}</span>
                </div>
              </div>
              <button
                className={styles.collapseToggleBtn}
                onClick={() => setIsExpanded(false)}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          ) : (
            <div className={styles.userProfileCollapsed}>
              <div className={styles.avatarCircle} title={user?.name || user?.email || 'User'}>
                {initials}
              </div>
              <button
                className={styles.collapseToggleBtn}
                onClick={() => setIsExpanded(true)}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.mobileMenuBtn} onClick={() => setIsMobileOpen(true)} aria-label="Open mobile menu">
              <Menu size={22} />
            </button>
            <div className={styles.searchWrapper}>
              <Search size={17} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search bookmarks, collections..."
                className={styles.headerSearch}
              />
            </div>
          </div>

          <div className={styles.headerRight}>
            <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || user?.email || 'User'}</span>
              <div className={styles.userAvatar}>{initials}</div>
            </div>
          </div>
        </header>

        <section className={styles.contentArea}>
          <div className={styles.breadcrumbContainer}>
            <Breadcrumb items={breadcrumbs} />
          </div>
          <Outlet />
        </section>
      </main>

      {/* Global Creation Modals */}
      <BookmarkForm
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        onSubmit={handleBookmarkSubmit}
        collections={collections}
        tags={tags}
        isLoading={isCreatingBookmark}
      />

      <CollectionForm
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onSubmit={handleCollectionSubmit}
        collections={collections}
        isLoading={isCreatingCollection}
      />

      <TagForm
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onSubmit={handleTagSubmit}
        isLoading={isCreatingTag}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          addToast('File imported successfully!', 'success', 'Import');
        }}
      />

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

export default DashboardLayout;