import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '../services/bookmark.service';
import type { BookmarkFormValues } from '../schemas/bookmark.schema';
import type { Bookmark, BookmarkFilters } from '../types/bookmark.types';

const BOOKMARKS_QUERY_KEY = ['bookmarks'];

export const useBookmarks = (filters?: BookmarkFilters) => {
  const queryClient = useQueryClient();

  const queryKey = filters
    ? [...BOOKMARKS_QUERY_KEY, filters]
    : BOOKMARKS_QUERY_KEY;

  const {
    data: bookmarks = [],
    isLoading,
    error,
  } = useQuery<Bookmark[]>({
    queryKey,
    queryFn: () => bookmarkService.getBookmarks(filters),
  });

  const createMutation = useMutation({
    mutationFn: bookmarkService.createBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BookmarkFormValues> }) =>
      bookmarkService.updateBookmark(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bookmarkService.deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      bookmarkService.toggleFavorite(id, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
    },
  });

  const toggleReadLaterMutation = useMutation({
    mutationFn: ({ id, readLater }: { id: string; readLater: boolean }) =>
      bookmarkService.toggleReadLater(id, readLater),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
    },
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
      bookmarkService.toggleArchive(id, isArchived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ bookmarkIds, action, payload }: { bookmarkIds: string[]; action: string; payload?: any }) =>
      bookmarkService.bulkOperation(bookmarkIds, action, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
    },
  });

  return {
    bookmarks,
    isLoading,
    error,
    createBookmark: createMutation.mutateAsync,
    updateBookmark: updateMutation.mutateAsync,
    deleteBookmark: deleteMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    toggleReadLater: toggleReadLaterMutation.mutateAsync,
    toggleArchive: toggleArchiveMutation.mutateAsync,
    bulkOperation: bulkMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulking: bulkMutation.isPending,
  };
};
