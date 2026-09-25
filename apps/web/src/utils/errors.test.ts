import { describe, expect, it } from 'vitest'
import {
  RATE_LIMIT_MESSAGE,
  describeWriteError,
  isPermissionDenied,
  isRateLimited,
} from './errors'

describe('write error helpers', () => {
  const rateLimit = {
    message: 'rate_limit_exceeded: at most 5 posts per 00:10:00',
    code: 'P0001',
  }
  const rls = new Error('new row violates row-level security policy for table "posts"')

  it('detects rate limits from plain Supabase error objects', () => {
    expect(isRateLimited(rateLimit)).toBe(true)
    expect(isRateLimited(rls)).toBe(false)
  })

  it('detects RLS denials', () => {
    expect(isPermissionDenied(rls)).toBe(true)
    expect(isPermissionDenied(new Error('timeout'))).toBe(false)
  })

  it('picks the most specific message', () => {
    expect(describeWriteError(rateLimit, 'fallback')).toBe(RATE_LIMIT_MESSAGE)
    expect(describeWriteError(rls, 'fallback', 'nope')).toBe('nope')
    expect(describeWriteError(new Error('x'), 'fallback')).toBe('fallback')
  })
})
