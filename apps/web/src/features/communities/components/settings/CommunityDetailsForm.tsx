import { useState } from 'react'
import { ImageUp, Loader2, X } from 'lucide-react'
import { Button, Label, Textarea } from '@/components/ui'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { useAuth } from '@/contexts/AuthContext'
import { validateImageFile } from '@/features/posts/api/postMedia'
import { uploadAvatar, uploadBanner } from '@/features/profile/api/profile'
import type { CommunityWithCondition } from '../../types'
import { useUpdateCommunityDetails } from '../../hooks/useCommunitySettings'

const MAX_DESCRIPTION = 500

function ImagePicker({
  id,
  label,
  onPick,
  disabled,
}: {
  id: string
  label: string
  onPick: (file: File) => void
  disabled?: boolean
}) {
  return (
    <label
      htmlFor={id}
      className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-surface-hover has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50"
    >
      <ImageUp className="h-4 w-4" aria-hidden="true" />
      {label}
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) onPick(file)
        }}
      />
    </label>
  )
}

export function CommunityDetailsForm({
  community,
}: {
  community: CommunityWithCondition
}) {
  const { user } = useAuth()
  const update = useUpdateCommunityDetails(community.id, community.slug)
  const [description, setDescription] = useState(community.description ?? '')
  const [logoUrl, setLogoUrl] = useState(community.logo_url)
  const [bannerUrl, setBannerUrl] = useState(community.banner_url)
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  async function handleUpload(kind: 'logo' | 'banner', file: File) {
    if (!user) return
    const error = validateImageFile(file)
    if (error) {
      setImageError(error)
      return
    }
    setImageError(null)
    setUploading(kind)
    try {
      // Uploaded into the moderator's own folder (the only prefix storage RLS lets
      // them write to); the community row then just points at the public URL.
      const url =
        kind === 'logo'
          ? await uploadAvatar(file, user.id)
          : await uploadBanner(file, user.id)
      if (kind === 'logo') setLogoUrl(url)
      else setBannerUrl(url)
    } catch (e) {
      setImageError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(null)
    }
  }

  const isDirty =
    description !== (community.description ?? '') ||
    logoUrl !== community.logo_url ||
    bannerUrl !== community.banner_url

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        update.mutate({
          description: description.trim() || null,
          logoUrl,
          bannerUrl,
        })
      }}
    >
      <div className="flex flex-col gap-2">
        <Label>Banner</Label>
        <div className="relative h-32 overflow-hidden rounded-xl border border-border bg-surface-sunken">
          {bannerUrl ? (
            <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-subtle-foreground">
              No banner — a gradient is shown instead
            </div>
          )}
          {uploading === 'banner' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <ImagePicker
            id="community-banner"
            label="Upload banner"
            disabled={uploading !== null}
            onPick={(f) => void handleUpload('banner', f)}
          />
          {bannerUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBannerUrl(null)}
            >
              <X className="h-4 w-4" /> Remove
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Logo</Label>
        <div className="flex items-center gap-4">
          <CommunityAvatar
            name={community.name}
            slug={community.slug}
            logoUrl={logoUrl}
            size="lg"
          />
          <div className="flex gap-2">
            <ImagePicker
              id="community-logo"
              label={uploading === 'logo' ? 'Uploading…' : 'Upload logo'}
              disabled={uploading !== null}
              onPick={(f) => void handleUpload('logo', f)}
            />
            {logoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLogoUrl(null)}
              >
                <X className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {imageError && (
        <p role="alert" className="text-sm text-danger">
          {imageError}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="community-description">Description</Label>
          <span className="text-xs tabular-nums text-subtle-foreground">
            {description.length}/{MAX_DESCRIPTION}
          </span>
        </div>
        <Textarea
          id="community-description"
          value={description}
          maxLength={MAX_DESCRIPTION}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Who is this community for, and what do people talk about here?"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isDirty || update.isPending || uploading !== null}
        >
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
