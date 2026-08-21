import { useQuery } from '@tanstack/react-query';
import { searchService, type SearchResults } from '../services/search.service';

export const useSearch = (query: string) => {
  const {
    data: results,
    isLoading,
    error,
  } = useQuery<SearchResults>({
    queryKey: ['search', query],
    queryFn: () => searchService.globalSearch(query),
    enabled: !!query && query.length > 1, // Only search if query is at least 2 chars
    staleTime: 60000, // 1 minute
  });

  return {
    results: results || { bookmarks: [], collections: [], tags: [] },
    isLoading,
    error,
  };
};
