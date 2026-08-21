import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Future Module Pages (Placeholders)
import Bookmarks from './pages/Bookmarks';
import { BookmarkDetail } from './pages/BookmarkDetail';
import ReaderView from './modules/bookmarks/components/ReaderView';
import Collections from './pages/Collections';
import Tags from './pages/Tags';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import ReadLater from './pages/ReadLater';
import Archive from './pages/Archive';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import RSS from './pages/RSS';
import PublicCollection from './pages/PublicCollection';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/shared/:token" element={<PublicCollection />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Distraction-free reader view */}
        <Route path="/bookmarks/:id/reader" element={<ReaderView />} />

        <Route element={<DashboardLayout />}>
          {/* Dashboard is the default root */}
          <Route path="/" element={<Dashboard />} />

          {/* Core Modules */}
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/bookmarks/:id" element={<BookmarkDetail />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/search" element={<Search />} />

          {/* Filtered Views */}
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/read-later" element={<ReadLater />} />
          <Route path="/archive" element={<Archive />} />

          {/* User & Preferences */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rss" element={<RSS />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;