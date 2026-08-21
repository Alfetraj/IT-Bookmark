import { useDashboardData } from '../modules/dashboard/hooks/useDashboardStats';
import { DashboardSection } from '../modules/dashboard/components/DashboardSection';
import { Home } from 'lucide-react';

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Home size={24} color="var(--primary-color)" />
        <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 300 }}>Dashboard</h2>
      </div>
      
      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading dashboard...</div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>Failed to load dashboard data.</div>
      ) : data ? (
        <>
          {data.sections.map((section) => (
            <DashboardSection key={section.id} section={section} dashboardData={data} />
          ))}
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
