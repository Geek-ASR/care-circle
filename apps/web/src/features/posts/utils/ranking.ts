/**
 * Reddit-style logarithmic hot ranking: order-of-magnitude of the score, decayed by age.
 * Applied client-side over each fetched page (fetched from a recency-bounded query) rather
 * than a stored column — a materialized `hot_rank` maintained by a scheduled job is the
 * right upgrade once this needs to scale past a few thousand posts per community.
 */
const EPOCH_OFFSET_SECONDS = 1_735_689_600 // 2025-01-01T00:00:00Z

export function hotScore(score: number, createdAt: string): number {
  const order = Math.log10(Math.max(Math.abs(score), 1))
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0
  const seconds = new Date(createdAt).getTime() / 1000 - EPOCH_OFFSET_SECONDS
  return sign * order + seconds / 45_000
}

/**
 * Heuristic: lots of comments relative to a low net score suggests disagreement rather
 * than consensus. Approximate in the absence of separate up/down counters.
 */
export function controversialScore(score: number, commentCount: number): number {
  return commentCount / (Math.abs(score) + 1)
}
