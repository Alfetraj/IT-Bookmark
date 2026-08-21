import api from '../../../services/api';
import type { Tag } from '../types/tag.types';
import type { TagFormValues } from '../schemas/tag.schema';

export const tagService = {
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get('/tags');
    return response.data;
  },

  createTag: async (data: TagFormValues): Promise<Tag> => {
    const response = await api.post('/tags', data);
    return response.data;
  },

  updateTag: async (id: string, data: TagFormValues): Promise<Tag> => {
    const response = await api.put(`/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },
};
