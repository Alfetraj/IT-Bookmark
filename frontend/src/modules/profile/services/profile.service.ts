import api from '../../../services/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (name: string): Promise<UserProfile> => {
    const response = await api.put('/profile', { name });
    return response.data;
  },
};
