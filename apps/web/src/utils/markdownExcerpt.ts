/**
 * Plain-text preview of a markdown body for feed cards: drops images, keeps link
 * text, strips formatting marks and collapses whitespace. Deliberately lightweight
 * (no markdown parser in the feed's hot path) — it only has to read well in a
 * two-line clamp, not round-trip.
 */
export function markdownExcerpt(markdown: string | null | undefined, maxLength = 280) {
  if (!markdown) return ''
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_~`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
}
