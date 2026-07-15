import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bookmarks" element={<div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Bookmarks — coming in Phase 4</div>} />
          <Route path="/collections" element={<div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Collections — coming in Phase 4</div>} />
          <Route path="/tags" element={<div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Tags — coming in Phase 4</div>} />
          <Route path="/settings" element={<div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Settings — coming soon</div>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
