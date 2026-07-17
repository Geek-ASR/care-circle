import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/services/queryClient'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import {
  getProfileByUsername,
  updateNotificationSettings,
  updatePrivacySettings,
  updateProfile,
  type PrivacySettings,
  type UpdateProfileInput,
} from '../api/profile'

export function useProfileByUsername(username: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: username
      ? [...queryKeys.profileByUsername(username), Boolean(user)]
      : ['profile', 'username', 'none'],
    queryFn: () => getProfileByUsername(username as string),
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

export function useUpdatePrivacySettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: PrivacySettings) => updatePrivacySettings(user!.id, settings),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(user!.id) })
      toast({ title: 'Privacy settings updated', variant: 'success' })
    },
    onError: () => {
      toast({ title: 'Could not update privacy settings', variant: 'danger' })
    },
  })
}

export function useUpdateNotificationSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Record<string, boolean>) =>
      updateNotificationSettings(user!.id, settings),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(user!.id) })
    },
    onError: () => {
      toast({ title: 'Could not update notification preferences', variant: 'danger' })
    },
  })
}
