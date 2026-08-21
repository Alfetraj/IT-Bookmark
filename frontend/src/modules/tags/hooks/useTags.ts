import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagService } from '../services/tag.service';
import type { TagFormValues } from '../schemas/tag.schema';
import type { Tag } from '../types/tag.types';

const TAGS_QUERY_KEY = ['tags'];

export const useTags = () => {
  const queryClient = useQueryClient();

  const {
    data: tags = [],
    isLoading,
    error,
  } = useQuery<Tag[]>({
    queryKey: TAGS_QUERY_KEY,
    queryFn: tagService.getTags,
  });

  const createMutation = useMutation({
    mutationFn: tagService.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TagFormValues }) =>
      tagService.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tagService.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });

  return {
    tags,
    isLoading,
    error,
    createTag: createMutation.mutateAsync,
    updateTag: updateMutation.mutateAsync,
    deleteTag: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
