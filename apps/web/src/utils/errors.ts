/** Message text from anything thrown by supabase-js / fetch / our own code. */
function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error ?? '')
}

/** Raised by the enforce_rate_limit() trigger (migration 20260101000023). */
export function isRateLimited(error: unknown): boolean {
  return messageOf(error).includes('rate_limit_exceeded')
}

/** Supabase surfaces RLS denials as this Postgres error text. */
export function isPermissionDenied(error: unknown): boolean {
  return /row-level security|permission denied/i.test(messageOf(error))
}

export const RATE_LIMIT_MESSAGE =
  "You're doing that a lot right now. Please take a short break and try again in a few minutes."

/**
 * User-facing explanation for a failed write: rate limits and permission
 * problems get specific wording, anything else falls back to `fallback`.
 */
export function describeWriteError(
  error: unknown,
  fallback: string,
  permissionMessage = "You don't have permission to do that here.",
): string {
  if (isRateLimited(error)) return RATE_LIMIT_MESSAGE
  if (isPermissionDenied(error)) return permissionMessage
  return fallback
}
