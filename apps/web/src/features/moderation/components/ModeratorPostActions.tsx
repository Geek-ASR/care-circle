import { Lock, LockOpen, Pin, PinOff } from 'lucide-react'
import {
  useIsModeratorOfCommunity,
  useTogglePostLock,
  useTogglePostPin,
} from '../hooks/useModeration'

export function ModeratorPostActions({
  postId,
  communityId,
  isPinned,
  isLocked,
}: {
  postId: string
  communityId: string
  isPinned: boolean
  isLocked: boolean
}) {
  const { isModerator } = useIsModeratorOfCommunity(communityId)
  const togglePin = useTogglePostPin(postId, communityId)
  const toggleLock = useTogglePostLock(postId, communityId)

  if (!isModerator) return null

  return (
    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
      <button
        type="button"
        className="flex items-center gap-1 hover:text-foreground"
        disabled={togglePin.isPending}
        onClick={() => togglePin.mutate(!isPinned)}
      >
        {isPinned ? (
          <>
            <PinOff className="h-3.5 w-3.5" /> Unpin
          </>
        ) : (
          <>
            <Pin className="h-3.5 w-3.5" /> Pin
          </>
        )}
      </button>
      <button
        type="button"
        className="flex items-center gap-1 hover:text-foreground"
        disabled={toggleLock.isPending}
        onClick={() => toggleLock.mutate(!isLocked)}
      >
        {isLocked ? (
          <>
            <LockOpen className="h-3.5 w-3.5" /> Unlock
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" /> Lock
          </>
        )}
      </button>
    </div>
  )
}
