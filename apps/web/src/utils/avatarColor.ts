/**
 * Deterministic gradient for an entity with no uploaded image (a community with no
 * logo, a user with no avatar). The same seed always maps to the same gradient, so
 * "Lupus Warriors" looks the same everywhere it appears, and a list of communities
 * reads as a varied, recognisable set rather than a column of identical grey circles.
 */
const GRADIENTS = [
  'from-teal-400 to-cyan-600',
  'from-violet-400 to-indigo-600',
  'from-rose-400 to-pink-600',
  'from-amber-300 to-orange-500',
  'from-emerald-400 to-teal-600',
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-purple-600',
  'from-lime-300 to-emerald-500',
] as const

export function avatarGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return `bg-linear-to-br ${GRADIENTS[Math.abs(hash) % GRADIENTS.length]}`
}
