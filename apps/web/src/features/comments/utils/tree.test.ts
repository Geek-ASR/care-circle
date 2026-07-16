import { describe, expect, it } from 'vitest'
import { buildCommentTree } from './tree'
import type { CommentWithAuthor } from '../types'

function comment(overrides: Partial<CommentWithAuthor>): CommentWithAuthor {
  return {
    id: 'id',
    post_id: 'post-1',
    author_id: 'author-1',
    parent_comment_id: null,
    body: 'body',
    path: 'id',
    is_edited: false,
    score: 0,
    status: 'published',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    author: null,
    ...overrides,
  }
}

describe('buildCommentTree', () => {
  it('nests replies under their parent regardless of fetch order', () => {
    const comments = [
      comment({
        id: 'child',
        parent_comment_id: 'root',
        created_at: '2026-01-01T00:01:00.000Z',
      }),
      comment({
        id: 'root',
        parent_comment_id: null,
        created_at: '2026-01-01T00:00:00.000Z',
      }),
    ]

    const tree = buildCommentTree(comments, {}, 'old')

    expect(tree).toHaveLength(1)
    expect(tree[0]?.id).toBe('root')
    expect(tree[0]?.children[0]?.id).toBe('child')
  })

  it('supports arbitrarily deep nesting', () => {
    const comments = Array.from({ length: 10 }, (_, i) =>
      comment({
        id: `c${i}`,
        parent_comment_id: i === 0 ? null : `c${i - 1}`,
        created_at: `2026-01-01T00:${String(i).padStart(2, '0')}:00.000Z`,
      }),
    )

    const tree = buildCommentTree(comments, {}, 'old')

    let depth = 0
    let node = tree[0]
    while (node?.children.length) {
      node = node.children[0]
      depth += 1
    }
    expect(depth).toBe(9)
  })

  it('sorts by score descending for "best"', () => {
    const comments = [
      comment({ id: 'low', score: 1 }),
      comment({ id: 'high', score: 10 }),
    ]

    const tree = buildCommentTree(comments, {}, 'best')

    expect(tree.map((c) => c.id)).toEqual(['high', 'low'])
  })

  it('attaches the current user vote for each comment', () => {
    const comments = [comment({ id: 'a' })]
    const tree = buildCommentTree(comments, { a: 1 }, 'old')
    expect(tree[0]?.userVote).toBe(1)
  })
})
