import { useEffect, useRef, useState } from 'react'
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { useAuth } from '@/contexts/AuthContext'
import { useCommunities } from '@/features/communities/hooks/useCommunities'
import { TagPicker } from '@/features/tags/components/TagPicker'
import { setPostTags } from '@/features/tags/api/tags'
import { StarRating } from './StarRating'
import { PollOptionsEditor } from '@/features/polls/components/PollOptionsEditor'
import { createPollOptions } from '@/features/polls/api/polls'
import { useCreatePost } from '../hooks/usePosts'
import { createPostSchema, REVIEW_POST_TYPES, type CreatePostValues } from '../schemas'
import { uploadPostImage, validateImageFile } from '../api/postMedia'
import type { PostType } from '@/types/database'

const TEXT_LIKE_TYPES: PostType[] = [
  'text',
  'question',
  'experience',
  'success_story',
  'research_discussion',
  'lifestyle_tip',
]

const BODY_PLACEHOLDER: Partial<Record<PostType, string>> = {
  text: 'Share your experience, ask a question, or start a discussion…',
  question: 'What do you want to ask the community?',
  experience: 'Describe what happened and how it affected you…',
  success_story: 'Tell us what worked for you…',
  research_discussion: 'Share the research and what you think it means…',
  lifestyle_tip: 'Share a tip that has helped you day-to-day…',
  treatment_review: 'How did this treatment go? Would you recommend it to others?',
  medication_review:
    'What was your experience with this medication? Side effects, results?',
  doctor_review: 'What was your experience with this doctor?',
  hospital_review: 'What was your experience at this hospital?',
}

const TITLE_PLACEHOLDER: Partial<Record<PostType, string>> = {
  treatment_review: 'What treatment are you reviewing? e.g. Physical therapy for AS',
  medication_review: 'What medication are you reviewing? e.g. Humira (adalimumab)',
  doctor_review: 'Who are you reviewing? e.g. Dr. Sarah Chen, Rheumatologist',
  hospital_review: 'Which hospital are you reviewing? e.g. City General Hospital',
  poll: 'What do you want to ask?',
}

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
      rating: undefined,
      pollOptions: ['', ''],
    },
  })

  // `communities` (and therefore `preselected`) loads asynchronously, but useForm's
  // defaultValues are only read once at mount - so a plain `defaultValues.communityId`
  // silently misses the community passed via ?community=slug from a community page's
  // "Create post" link. Apply it once the list has actually loaded instead.
  const appliedPreselect = useRef(false)
  useEffect(() => {
    if (preselected && !appliedPreselect.current) {
      setValue('communityId', preselected.id)
      appliedPreselect.current = true
    }
  }, [preselected, setValue])

  const postType = watch('postType')
  const body = watch('body') ?? ''
  const rating = watch('rating') ?? 0
  const pollOptions = watch('pollOptions') ?? ['', '']

  const isTextLike = TEXT_LIKE_TYPES.includes(postType)
  const isReview = REVIEW_POST_TYPES.includes(
    postType as (typeof REVIEW_POST_TYPES)[number],
  )

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
        rating: isReview ? values.rating : undefined,
      })

      if (values.postType === 'image' && imageFile) {
        await uploadPostImage(imageFile, user.id, post.id)
      }

      if (values.postType === 'poll') {
        const filledOptions = (values.pollOptions ?? [])
          .map((option) => option.trim())
          .filter((option) => option.length > 0)
        await createPollOptions(post.id, filledOptions)
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="postType">Post type</Label>
        <Controller
          control={control}
          name="postType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="postType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Discussion</SelectLabel>
                  <SelectItem value="text">Text post</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="success_story">Success story</SelectItem>
                  <SelectItem value="research_discussion">Research discussion</SelectItem>
                  <SelectItem value="lifestyle_tip">Lifestyle tip</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Media &amp; links</SelectLabel>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Poll</SelectLabel>
                  <SelectItem value="poll">Poll</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Reviews</SelectLabel>
                  <SelectItem value="treatment_review">Treatment review</SelectItem>
                  <SelectItem value="medication_review">Medication review</SelectItem>
                  <SelectItem value="doctor_review">Doctor review</SelectItem>
                  <SelectItem value="hospital_review">Hospital review</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder={TITLE_PLACEHOLDER[postType]}
          aria-invalid={Boolean(errors.title)}
          {...register('title')}
        />
        {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
      </div>

      {isReview && (
        <div className="flex flex-col gap-1.5">
          <Label>Rating</Label>
          <StarRating value={rating} onChange={(v) => setValue('rating', v)} />
          {errors.rating && (
            <p className="text-xs text-danger">{errors.rating.message}</p>
          )}
        </div>
      )}

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

      {(isTextLike || isReview || postType === 'poll') && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="body">
            {postType === 'poll' ? 'Description (optional)' : 'Body'}
          </Label>
          <MarkdownEditor
            id="body"
            value={body}
            onChange={(v) => setValue('body', v, { shouldValidate: true })}
            placeholder={BODY_PLACEHOLDER[postType] ?? 'Add more context (optional)…'}
          />
          {errors.body && <p className="text-xs text-danger">{errors.body.message}</p>}
        </div>
      )}

      {postType === 'poll' && (
        <>
          <PollOptionsEditor
            options={pollOptions}
            onChange={(next) => setValue('pollOptions', next, { shouldValidate: true })}
          />
          {errors.pollOptions && (
            <p className="text-xs text-danger">{errors.pollOptions.message}</p>
          )}
        </>
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
