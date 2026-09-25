import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import { deleteDraft, getLatestDraft, saveDraft, type DraftContent } from '../api/drafts'

export type DraftStatus = 'idle' | 'saving' | 'saved' | 'error'

const AUTOSAVE_DELAY_MS = 1500

function isEmpty(content: DraftContent) {
  return !content.title.trim() && !content.body.trim()
}

function sameContent(a: DraftContent | null, b: DraftContent) {
  return (
    a !== null &&
    a.title === b.title &&
    a.body === b.body &&
    a.communityId === b.communityId &&
    a.postType === b.postType
  )
}

/**
 * Autosaves the post composer to the `drafts` table. Each user has a single draft
 * "slot": the most recent draft is offered for restore on mount, and whatever the
 * user types next is saved into that same row (so drafts never pile up).
 *
 * Nothing is written until the user has actually edited something (`markDirty`),
 * so opening and closing the composer never creates an empty draft.
 */
export function useDraftAutosave(content: DraftContent) {
  const { user } = useAuth()
  const draftIdRef = useRef<string | null>(null)
  const lastSavedRef = useRef<DraftContent | null>(null)
  const dirtyRef = useRef(false)
  const [status, setStatus] = useState<DraftStatus>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [offerDismissed, setOfferDismissed] = useState(false)

  const { data: latestDraft } = useQuery({
    queryKey: ['drafts', 'latest', user?.id],
    queryFn: () => getLatestDraft(user!.id),
    enabled: Boolean(user),
    staleTime: Infinity,
    gcTime: 0,
  })

  // Adopt the existing draft's row so autosave overwrites it rather than adding one.
  useEffect(() => {
    if (latestDraft && !draftIdRef.current) draftIdRef.current = latestDraft.id
  }, [latestDraft])

  // Debounce a serialized copy: `content` is a fresh object every render, so
  // debouncing it directly would restart the timer (and re-render) forever.
  const debouncedKey = useDebounce(JSON.stringify(content), AUTOSAVE_DELAY_MS)

  useEffect(() => {
    const debounced = JSON.parse(debouncedKey) as DraftContent
    if (!user || !dirtyRef.current) return
    if (isEmpty(debounced) || sameContent(lastSavedRef.current, debounced)) return

    let cancelled = false
    setStatus('saving')
    saveDraft(user.id, draftIdRef.current, debounced)
      .then((id) => {
        if (cancelled) return
        draftIdRef.current = id
        lastSavedRef.current = debounced
        setStatus('saved')
        setSavedAt(new Date())
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [debouncedKey, user])

  const markDirty = useCallback(() => {
    dirtyRef.current = true
    setOfferDismissed(true)
  }, [])

  /** Removes the draft, e.g. after the post is published or the user discards it. */
  const clear = useCallback(async () => {
    const id = draftIdRef.current
    draftIdRef.current = null
    lastSavedRef.current = null
    dirtyRef.current = false
    setStatus('idle')
    setSavedAt(null)
    setOfferDismissed(true)
    if (id) {
      try {
        await deleteDraft(id)
      } catch {
        /* a leftover draft is harmless; it'll be offered next time */
      }
    }
  }, [])

  const hasRestorableDraft =
    !offerDismissed &&
    latestDraft != null &&
    Boolean(latestDraft.title?.trim() || latestDraft.body?.trim())

  return {
    status,
    savedAt,
    markDirty,
    clear,
    restorableDraft: hasRestorableDraft ? latestDraft : null,
    dismissOffer: () => setOfferDismissed(true),
  }
}
