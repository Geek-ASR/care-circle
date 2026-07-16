import { z } from 'zod'

export const createPostSchema = z.object({
  communityId: z.string().uuid('Choose a community'),
  postType: z.enum(['text', 'image', 'link']),
  title: z.string().trim().min(3, 'At least 3 characters').max(300, 'Title is too long'),
  body: z.string().trim().max(20_000, 'That post is too long').optional(),
  url: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
})
export type CreatePostValues = z.infer<typeof createPostSchema>
