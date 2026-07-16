import { z } from 'zod'

export const onboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'At least 3 characters')
    .max(30, 'At most 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, and underscores only'),
  displayName: z.string().trim().min(1, 'Display name is required').max(50, 'Too long'),
  bio: z.string().trim().max(280, 'Keep it under 280 characters').optional(),
  diagnosisConditionId: z.string().uuid().optional().or(z.literal('')),
  diagnosisYear: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}$/.test(val), 'Enter a 4-digit year'),
})
export type OnboardingValues = z.infer<typeof onboardingSchema>
