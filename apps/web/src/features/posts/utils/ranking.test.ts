import { describe, expect, it } from 'vitest'
import { controversialScore, hotScore } from './ranking'

describe('hotScore', () => {
  it('ranks a higher-scored post above a lower-scored post posted at the same time', () => {
    const now = new Date().toISOString()
    expect(hotScore(50, now)).toBeGreaterThan(hotScore(5, now))
  })

  it('ranks a more recent post above an older post with the same score', () => {
    const older = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
    const newer = new Date().toISOString()
    expect(hotScore(10, newer)).toBeGreaterThan(hotScore(10, older))
  })

  it('treats negative scores as ranking below zero-score posts at the same time', () => {
    const now = new Date().toISOString()
    expect(hotScore(-10, now)).toBeLessThan(hotScore(0, now))
  })
})

describe('controversialScore', () => {
  it('scores a high-comment, near-zero-score post higher than a lopsided high-score post', () => {
    const controversial = controversialScore(1, 200)
    const uncontroversial = controversialScore(200, 10)
    expect(controversial).toBeGreaterThan(uncontroversial)
  })

  it('never divides by zero when score is zero', () => {
    expect(Number.isFinite(controversialScore(0, 5))).toBe(true)
  })
})
