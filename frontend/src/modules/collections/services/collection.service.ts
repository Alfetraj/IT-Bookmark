import api from '../../../services/api';
import type { Collection } from '../types/collection.types';
import type { CollectionFormValues } from '../schemas/collection.schema';

export const collectionService = {
  getCollections: async (): Promise<Collection[]> => {
    const response = await api.get('/collections');
    return response.data;
  },

  createCollection: async (data: CollectionFormValues): Promise<Collection> => {
    const response = await api.post('/collections', data);
    return response.data;
  },

  updateCollection: async (id: string, data: CollectionFormValues): Promise<Collection> => {
    const response = await api.put(`/collections/${id}`, data);
    return response.data;
  },

  deleteCollection: async (id: string): Promise<void> => {
    await api.delete(`/collections/${id}`);
  },
};
