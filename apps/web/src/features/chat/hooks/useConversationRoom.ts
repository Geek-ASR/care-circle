import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { joinRoom, type RoomConnection } from '@/services/realtime'

const TYPING_TIMEOUT_MS = 3500
const TYPING_THROTTLE_MS = 2000

/**
 * Live "online" and "typing…" state for a conversation, over Realtime presence and
 * broadcast. Returns the other participants' ids that are online / typing, plus a
 * throttled `notifyTyping` to call from the composer on each keystroke.
 */
export function useConversationRoom(conversationId: string | undefined) {
  const { user } = useAuth()
  const [onlineIds, setOnlineIds] = useState<string[]>([])
  const [typingIds, setTypingIds] = useState<string[]>([])
  const connectionRef = useRef<RoomConnection | null>(null)
  const lastSentRef = useRef(0)
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    if (!conversationId || !user) return
    const timers = timersRef.current

    const connection = joinRoom(`conversation:${conversationId}`, user.id, {
      onPresence: (ids) => setOnlineIds(ids.filter((id) => id !== user.id)),
      onTyping: (id) => {
        setTypingIds((current) => (current.includes(id) ? current : [...current, id]))
        const existing = timers.get(id)
        if (existing) clearTimeout(existing)
        timers.set(
          id,
          setTimeout(() => {
            setTypingIds((current) => current.filter((t) => t !== id))
            timers.delete(id)
          }, TYPING_TIMEOUT_MS),
        )
      },
    })
    connectionRef.current = connection

    return () => {
      connection.leave()
      connectionRef.current = null
      timers.forEach(clearTimeout)
      timers.clear()
      setOnlineIds([])
      setTypingIds([])
    }
  }, [conversationId, user])

  const notifyTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastSentRef.current < TYPING_THROTTLE_MS) return
    lastSentRef.current = now
    connectionRef.current?.sendTyping()
  }, [])

  /** Clears a sender's typing state as soon as their message actually arrives. */
  const clearTyping = useCallback((userId: string) => {
    setTypingIds((current) => current.filter((t) => t !== userId))
  }, [])

  return { onlineIds, typingIds, notifyTyping, clearTyping }
}
