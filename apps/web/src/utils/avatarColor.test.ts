import { describe, expect, it } from 'vitest'
import { avatarGradient } from './avatarColor'

describe('avatarGradient', () => {
  it('is deterministic for the same seed', () => {
    expect(avatarGradient('lupus')).toBe(avatarGradient('lupus'))
  })

  it('always returns a gradient class', () => {
    for (const seed of ['', 'a', 'Crohn’s & Colitis', 'x'.repeat(500)]) {
      expect(avatarGradient(seed)).toMatch(/^bg-linear-to-br from-\S+ to-\S+$/)
    }
  })

  it('spreads different seeds across more than one gradient', () => {
    const seeds = ['lupus', 'ibd', 'anxiety', 'long-covid', 'type1', 'migraine']
    expect(new Set(seeds.map(avatarGradient)).size).toBeGreaterThan(1)
  })
})
