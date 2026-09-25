export interface ContributorTier {
  label: string
  variant: 'primary' | 'accent' | 'success'
}

/**
 * Community-recognition tiers derived from reputation (earned from upvotes:
 * +5 per post upvote, +2 per comment upvote). Thresholds are intentionally
 * high enough that a flair means sustained, well-received participation.
 */
export function contributorTier(
  reputation: number | null | undefined,
): ContributorTier | null {
  if (reputation == null) return null
  if (reputation >= 1000) return { label: 'Community pillar', variant: 'accent' }
  if (reputation >= 250) return { label: 'Trusted contributor', variant: 'primary' }
  if (reputation >= 50) return { label: 'Helpful member', variant: 'success' }
  return null
}
