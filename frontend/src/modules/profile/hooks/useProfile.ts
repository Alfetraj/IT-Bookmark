import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, type UserProfile } from '../services/profile.service';

const PROFILE_QUERY_KEY = ['profile'];

export const useProfile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileService.getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: (name: string) => profileService.updateProfile(name),
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
