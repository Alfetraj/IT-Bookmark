import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionService } from '../services/collection.service';
import type { CollectionFormValues } from '../schemas/collection.schema';
import type { Collection } from '../types/collection.types';

const COLLECTIONS_QUERY_KEY = ['collections'];

export const useCollections = () => {
  const queryClient = useQueryClient();

  const {
    data: collections = [],
    isLoading,
    error,
  } = useQuery<Collection[]>({
    queryKey: COLLECTIONS_QUERY_KEY,
    queryFn: collectionService.getCollections,
  });

  const createMutation = useMutation({
    mutationFn: collectionService.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CollectionFormValues }) =>
      collectionService.updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: collectionService.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });

  return {
    collections,
    isLoading,
    error,
    createCollection: createMutation.mutateAsync,
    updateCollection: updateMutation.mutateAsync,
    deleteCollection: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
