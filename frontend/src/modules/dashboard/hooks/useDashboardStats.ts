import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardData } from '../services/dashboard.service';

const DASHBOARD_DATA_QUERY_KEY = ['dashboard-data'];

export const useDashboardData = () => {
  const {
    data,
    isLoading,
    error,
  } = useQuery<DashboardData>({
    queryKey: DASHBOARD_DATA_QUERY_KEY,
    queryFn: dashboardService.getStats,
  });

  return {
    data,
    isLoading,
    error,
  };
};
