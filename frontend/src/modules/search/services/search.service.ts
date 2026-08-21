import api from '../../../services/api';
import type { Bookmark } from '../../bookmarks/types/bookmark.types';
import type { Collection } from '../../collections/types/collection.types';
import type { Tag } from '../../tags/types/tag.types';

export interface SearchResults {
  bookmarks: Bookmark[];
  collections: Collection[];
  tags: Tag[];
}

export const searchService = {
  globalSearch: async (query: string): Promise<SearchResults> => {
    if (!query) {
      return { bookmarks: [], collections: [], tags: [] };
    }
    const response = await api.get('/search', { params: { q: query } });
    return response.data;
  },
};
