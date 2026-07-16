import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins truthy class values', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })

  it('lets a later conflicting Tailwind class win over an earlier one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
