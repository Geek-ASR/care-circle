import { describe, expect, it } from 'vitest'
import { expiryFor, isActive, isPermissionDenied, strongestActive } from './restrictions'

const now = new Date('2026-01-10T12:00:00Z')

describe('expiryFor', () => {
  it('adds the chosen number of days', () => {
    expect(expiryFor('7d', now)).toBe('2026-01-17T12:00:00.000Z')
  })
  it('returns null for permanent restrictions', () => {
    expect(expiryFor('permanent', now)).toBeNull()
  })
})

describe('isActive', () => {
  it('treats a null expiry as permanent', () => {
    expect(isActive({ expires_at: null }, now)).toBe(true)
  })
  it('compares against now', () => {
    expect(isActive({ expires_at: '2026-01-11T00:00:00Z' }, now)).toBe(true)
    expect(isActive({ expires_at: '2026-01-09T00:00:00Z' }, now)).toBe(false)
  })
})

describe('strongestActive', () => {
  it('prefers an active ban over an active mute and ignores expired rows', () => {
    const mute = { kind: 'mute' as const, expires_at: null }
    const expiredBan = { kind: 'ban' as const, expires_at: '2026-01-01T00:00:00Z' }
    expect(strongestActive([mute, expiredBan], now)).toBe(mute)
    const ban = { kind: 'ban' as const, expires_at: null }
    expect(strongestActive([mute, ban], now)).toBe(ban)
    expect(strongestActive([expiredBan], now)).toBeNull()
  })
})

describe('isPermissionDenied', () => {
  it('recognises Supabase RLS errors', () => {
    expect(
      isPermissionDenied(
        new Error('new row violates row-level security policy for table "posts"'),
      ),
    ).toBe(true)
    expect(isPermissionDenied(new Error('network down'))).toBe(false)
  })
})
