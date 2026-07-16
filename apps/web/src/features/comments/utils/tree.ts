import type { CommentNode, CommentSort, CommentWithAuthor } from '../types'

function sortSiblings(nodes: CommentNode[], sort: CommentSort) {
  nodes.sort((a, b) => {
    if (sort === 'best') return b.score - a.score
    if (sort === 'old') return a.created_at.localeCompare(b.created_at)
    return b.created_at.localeCompare(a.created_at)
  })
  nodes.forEach((node) => sortSiblings(node.children, sort))
}

export function buildCommentTree(
  comments: CommentWithAuthor[],
  votes: Record<string, 1 | -1>,
  sort: CommentSort,
): CommentNode[] {
  const nodeById = new Map<string, CommentNode>()
  const roots: CommentNode[] = []

  for (const comment of comments) {
    nodeById.set(comment.id, {
      ...comment,
      userVote: votes[comment.id] ?? 0,
      children: [],
    })
  }

  for (const comment of comments) {
    const node = nodeById.get(comment.id)!
    if (comment.parent_comment_id && nodeById.has(comment.parent_comment_id)) {
      nodeById.get(comment.parent_comment_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  sortSiblings(roots, sort)
  return roots
}
