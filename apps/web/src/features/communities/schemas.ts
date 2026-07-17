import { z } from 'zod'

export const createCommunitySchema = z.object({
  name: z.string().trim().min(3, 'At least 3 characters').max(80, 'Name is too long'),
  slug: z
    .string()
    .trim()
    .min(3, 'At least 3 characters')
    .max(50, 'Slug is too long')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Lowercase letters, numbers, and hyphens only'),
  description: z.string().trim().max(500, 'Description is too long').optional(),
  conditionId: z.string().uuid().optional().or(z.literal('')),
})
export type CreateCommunityValues = z.infer<typeof createCommunitySchema>

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}
