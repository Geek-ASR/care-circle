import { describe, expect, it } from 'vitest'
import { contributorTier } from './tiers'

describe('contributorTier', () => {
  it('returns nothing below the first threshold or without data', () => {
    expect(contributorTier(undefined)).toBeNull()
    expect(contributorTier(49)).toBeNull()
  })

  it('maps reputation to increasing tiers', () => {
    expect(contributorTier(50)?.label).toBe('Helpful member')
    expect(contributorTier(250)?.label).toBe('Trusted contributor')
    expect(contributorTier(1000)?.label).toBe('Community pillar')
  })
})
