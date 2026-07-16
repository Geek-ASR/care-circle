import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/services/queryClient'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import {
  getProfileByUsername,
  updateProfile,
  type UpdateProfileInput,
} from '../api/profile'

export function useProfileByUsername(username: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: username
      ? [...queryKeys.profileByUsername(username), Boolean(user)]
      : ['profile', 'username', 'none'],
    queryFn: () => getProfileByUsername(username as string, Boolean(user)),
    enabled: Boolean(username),
  })
}

export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(user!.id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(user!.id) })
      toast({ title: 'Profile updated', variant: 'success' })
    },
    onError: () => {
      toast({ title: 'Could not update profile', variant: 'danger' })
    },
  })
}
