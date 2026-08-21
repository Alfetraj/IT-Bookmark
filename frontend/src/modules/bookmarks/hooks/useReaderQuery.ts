import { useQuery } from '@tanstack/react-query';
import { bookmarkService } from '../services/bookmark.service';

export const useReaderQuery = (bookmarkId: string | undefined) => {
  return useQuery({
    queryKey: ['bookmark-reader', bookmarkId],
    queryFn: () => bookmarkService.getBookmarkReader(bookmarkId!),
    enabled: !!bookmarkId,
    retry: (failureCount, error: any) => {
      // Don't retry if the archive failed or is definitely not available
      if (error?.response?.status === 422 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    // If pending (202), we could poll, but let's just retry a few times or rely on the user to refresh
    refetchInterval: (query) => {
      // If error is 202 (pending), poll every 5 seconds
      if (query.state.error && (query.state.error as any).response?.status === 202) {
        return 5000;
      }
      return false;
    }
  });
};
