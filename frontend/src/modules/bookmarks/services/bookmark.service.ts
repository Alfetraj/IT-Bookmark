import api from '../../../services/api';
import type { Bookmark, BookmarkFilters } from '../types/bookmark.types';
import type { BookmarkFormValues } from '../schemas/bookmark.schema';

export const bookmarkService = {
  getBookmarks: async (filters?: BookmarkFilters): Promise<Bookmark[]> => {
    const params: Record<string, string> = {};

    if (filters?.collectionId !== undefined) {
      params.collection_id = filters.collectionId ?? '';
    }
    if (filters?.isFavorite !== undefined) {
      params.is_favorite = String(filters.isFavorite);
    }
    if (filters?.readLater !== undefined) {
      params.read_later = String(filters.readLater);
    }
    if (filters?.isArchived !== undefined) {
      params.is_archived = String(filters.isArchived);
    }
    if (filters?.searchQuery) {
      params.q = filters.searchQuery;
    }

    const response = await api.get('/bookmarks', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.bookmarks)) {
      return response.data.bookmarks;
    }
    return [];
  },

  getBookmarkById: async (id: string): Promise<Bookmark> => {
    const response = await api.get(`/bookmarks/${id}`);
    return response.data;
  },

  getBookmarkReader: async (id: string): Promise<{ id: string; title: string; domain: string; url: string; content: string }> => {
    const response = await api.get(`/bookmarks/${id}/reader`);
    return response.data;
  },

  createBookmark: async (data: BookmarkFormValues): Promise<Bookmark> => {
    const response = await api.post('/bookmarks', data);
    return response.data;
  },

  updateBookmark: async (id: string, data: Partial<BookmarkFormValues>): Promise<Bookmark> => {
    const response = await api.put(`/bookmarks/${id}`, data);
    return response.data;
  },

  deleteBookmark: async (id: string): Promise<void> => {
    await api.delete(`/bookmarks/${id}`);
  },

  toggleFavorite: async (id: string, isFavorite: boolean): Promise<Bookmark> => {
    const response = await api.patch(`/bookmarks/${id}`, { isFavorite });
    return response.data;
  },

  toggleReadLater: async (id: string, readLater: boolean): Promise<Bookmark> => {
    const response = await api.patch(`/bookmarks/${id}`, { readLater });
    return response.data;
  },

  toggleArchive: async (id: string, isArchived: boolean): Promise<Bookmark> => {
    const response = await api.patch(`/bookmarks/${id}`, { isArchived });
    return response.data;
  },

  bulkOperation: async (
    bookmarkIds: string[],
    action: string,
    payload?: any
  ): Promise<{ total: number; succeeded: number; failed: number }> => {
    const response = await api.post('/bookmarks/bulk', {
      bookmarkIds,
      action,
      payload,
    });
    return response.data;
  },
};
