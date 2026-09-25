import type { CommunityBan, CommunityBanKind } from '@/types/database'

export const DURATIONS = [
  { value: '1d', label: '24 hours', days: 1 },
  { value: '7d', label: '7 days', days: 7 },
  { value: '30d', label: '30 days', days: 30 },
  { value: 'permanent', label: 'Permanently', days: null },
] as const

export type DurationValue = (typeof DURATIONS)[number]['value']

export function expiryFor(duration: DurationValue, now = new Date()): string | null {
  const days = DURATIONS.find((d) => d.value === duration)?.days ?? null
  if (days === null) return null
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
}

export function isActive(
  ban: Pick<CommunityBan, 'expires_at'>,
  now = new Date(),
): boolean {
  return ban.expires_at === null || new Date(ban.expires_at) > now
}

/** The restriction that matters most for UI: an active ban beats an active mute. */
export function strongestActive<T extends Pick<CommunityBan, 'kind' | 'expires_at'>>(
  bans: T[],
  now = new Date(),
): T | null {
  const active = bans.filter((b) => isActive(b, now))
  const order: Record<CommunityBanKind, number> = { ban: 0, mute: 1 }
  return active.sort((a, b) => order[a.kind] - order[b.kind])[0] ?? null
}

export { isPermissionDenied } from '@/utils/errors'
