import { z } from 'zod'

export const REVIEW_POST_TYPES = [
  'treatment_review',
  'medication_review',
  'doctor_review',
  'hospital_review',
] as const

export const createPostSchema = z
  .object({
    communityId: z.string().uuid('Choose a community'),
    postType: z.enum([
      'text',
      'image',
      'link',
      'poll',
      'question',
      'experience',
      'success_story',
      'treatment_review',
      'medication_review',
      'doctor_review',
      'hospital_review',
      'research_discussion',
      'lifestyle_tip',
    ]),
    title: z
      .string()
      .trim()
      .min(3, 'At least 3 characters')
      .max(300, 'Title is too long'),
    body: z.string().trim().max(20_000, 'That post is too long').optional(),
    url: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
    rating: z.number().int().min(1).max(5).optional(),
    pollOptions: z.array(z.string().trim().max(120)).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.postType === 'poll') {
      const filled = (values.pollOptions ?? []).filter((option) => option.length > 0)
      if (filled.length < 2) {
        ctx.addIssue({
          code: 'custom',
          message: 'Add at least 2 poll options',
          path: ['pollOptions'],
        })
      }
    }
    if (
      REVIEW_POST_TYPES.includes(values.postType as (typeof REVIEW_POST_TYPES)[number])
    ) {
      if (!values.rating) {
        ctx.addIssue({ code: 'custom', message: 'Choose a rating', path: ['rating'] })
      }
    }
  })
export type CreatePostValues = z.infer<typeof createPostSchema>
