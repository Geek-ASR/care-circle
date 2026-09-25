import { describe, expect, it } from 'vitest'
import { markdownExcerpt } from './markdownExcerpt'

describe('markdownExcerpt', () => {
  it('returns an empty string for empty input', () => {
    expect(markdownExcerpt(null)).toBe('')
    expect(markdownExcerpt('')).toBe('')
  })

  it('strips headings, emphasis, lists and quotes', () => {
    expect(markdownExcerpt('# Title\n\n**Bold** and _soft_\n- one\n> quoted')).toBe(
      'Title Bold and soft one quoted',
    )
  })

  it('keeps link text but drops images and code blocks', () => {
    expect(
      markdownExcerpt('See [the study](https://x.org) ![chart](a.png)\n```\ncode\n```'),
    ).toBe('See the study')
  })

  it('truncates long text with an ellipsis', () => {
    const result = markdownExcerpt('word '.repeat(100), 20)
    expect(result.endsWith('…')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(21)
  })
})
