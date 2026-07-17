import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageUp } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { useAuth } from '@/contexts/AuthContext'
import { useCommunities } from '@/features/communities/hooks/useCommunities'
import { TagPicker } from '@/features/tags/components/TagPicker'
import { setPostTags } from '@/features/tags/api/tags'
import { useCreatePost } from '../hooks/usePosts'
import { createPostSchema, type CreatePostValues } from '../schemas'
import { uploadPostImage, validateImageFile } from '../api/postMedia'

export function CreatePostForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: communities } = useCommunities()
  const createPost = useCreatePost()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const preselected = communities?.find((c) => c.slug === searchParams.get('community'))

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      communityId: preselected?.id ?? '',
      postType: 'text',
      title: '',
      body: '',
      url: '',
    },
  })

  const postType = watch('postType')
  const body = watch('body') ?? ''

  function handleImageChange(file: File | null) {
    setImageError(null)
    if (!file) {
      setImageFile(null)
      return
    }
    const error = validateImageFile(file)
    if (error) {
      setImageError(error)
      return
    }
    setImageFile(file)
  }

  async function onSubmit(values: CreatePostValues) {
    if (!user) return
    setFormError(null)

    if (values.postType === 'image' && !imageFile) {
      setImageError('Choose an image to upload')
      return
    }

    try {
      const post = await createPost.mutateAsync({
        communityId: values.communityId,
        authorId: user.id,
        postType: values.postType,
        title: values.title,
        body: values.postType !== 'link' ? values.body : undefined,
        url: values.postType === 'link' ? values.url : undefined,
      })

      if (values.postType === 'image' && imageFile) {
        await uploadPostImage(imageFile, user.id, post.id)
      }

      if (selectedTagIds.length > 0) {
        await setPostTags(post.id, selectedTagIds)
      }

      navigate(`/posts/${post.id}`)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not create your post.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="community">Community</Label>
        <Controller
          control={control}
          name="communityId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="community" aria-invalid={Boolean(errors.communityId)}>
                <SelectValue placeholder="Choose a community" />
              </SelectTrigger>
              <SelectContent>
                {communities?.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.communityId && (
          <p className="text-xs text-danger">{errors.communityId.message}</p>
        )}
      </div>

      <Tabs
        value={postType}
        onValueChange={(v) => setValue('postType', v as CreatePostValues['postType'])}
      >
        <TabsList>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="link">Link</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" aria-invalid={Boolean(errors.title)} {...register('title')} />
        {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
      </div>

      {postType === 'link' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://"
            aria-invalid={Boolean(errors.url)}
            {...register('url')}
          />
          {errors.url && <p className="text-xs text-danger">{errors.url.message}</p>}
        </div>
      )}

      {postType === 'text' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="body">Body</Label>
          <MarkdownEditor
            id="body"
            value={body}
            onChange={(v) => setValue('body', v, { shouldValidate: true })}
            placeholder="Share your experience, ask a question, or start a discussion…"
          />
          {errors.body && <p className="text-xs text-danger">{errors.body.message}</p>}
        </div>
      )}

      {postType === 'image' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="image">Image</Label>
          <label
            htmlFor="image"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground hover:bg-surface-hover"
          >
            <ImageUp className="h-5 w-5" />
            {imageFile ? imageFile.name : 'Click to choose an image (max 8MB)'}
          </label>
          <input
            id="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
          />
          {imageError && <p className="text-xs text-danger">{imageError}</p>}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Tags (optional)</Label>
        <TagPicker selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} />
      </div>

      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? 'Posting…' : 'Post'}
      </Button>
    </form>
  )
}
