import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  Label,
  Textarea,
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { validateImageFile } from '@/features/posts/api/postMedia'
import { uploadAvatar, uploadBanner } from '../api/profile'
import { useUpdateProfile } from '../hooks/useProfile'

interface FormValues {
  displayName: string
  bio: string
  country: string
  website: string
}

export function ProfileSettingsForm() {
  const { user, profile } = useAuth()
  const updateProfile = useUpdateProfile()
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null)
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url ?? null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      displayName: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
      country: profile?.country ?? '',
      website: profile?.website ?? '',
    },
  })

  async function handleAvatarChange(file: File | null) {
    if (!file || !user) return
    const error = validateImageFile(file)
    if (error) {
      setImageError(error)
      return
    }
    setImageError(null)
    setUploading(true)
    try {
      setAvatarUrl(await uploadAvatar(file, user.id))
    } finally {
      setUploading(false)
    }
  }

  async function handleBannerChange(file: File | null) {
    if (!file || !user) return
    const error = validateImageFile(file)
    if (error) {
      setImageError(error)
      return
    }
    setImageError(null)
    setUploading(true)
    try {
      setBannerUrl(await uploadBanner(file, user.id))
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(values: FormValues) {
    await updateProfile.mutateAsync({
      displayName: values.displayName,
      bio: values.bio,
      country: values.country,
      website: values.website,
      avatarUrl,
      bannerUrl,
    })
  }

  const initials = (profile?.display_name ?? profile?.username ?? '?')
    .charAt(0)
    .toUpperCase()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <Label
            htmlFor="avatar"
            className="cursor-pointer text-sm text-primary hover:underline"
          >
            {uploading ? 'Uploading…' : 'Change avatar'}
          </Label>
          <input
            id="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => void handleAvatarChange(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="banner">Banner image</Label>
        {bannerUrl && (
          <img src={bannerUrl} alt="" className="h-24 w-full rounded-md object-cover" />
        )}
        <input
          id="banner"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => void handleBannerChange(e.target.files?.[0] ?? null)}
          className="text-sm text-muted-foreground"
        />
      </div>

      {imageError && <p className="text-xs text-danger">{imageError}</p>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" {...register('displayName')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" {...register('bio')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register('country')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://"
            {...register('website')}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting || uploading} className="self-start">
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
