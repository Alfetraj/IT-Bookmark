import api from '../../../services/api';
import type { Bookmark } from '../../bookmarks/types/bookmark.types';

export interface DashboardSection {
  id: string;
  type: 'STATS' | 'RECENT_LINKS' | 'PINNED_LINKS' | 'COLLECTION';
  order_index: number;
  collection_id?: string;
}

export interface DashboardStats {
  totalBookmarks: number;
  totalCollections: number;
  totalTags: number;
}

export interface DashboardData {
  sections: DashboardSection[];
  stats: DashboardStats;
  recentLinks: Bookmark[];
  pinnedLinks: Bookmark[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
