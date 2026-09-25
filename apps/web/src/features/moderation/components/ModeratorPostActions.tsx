import { Lock, LockOpen, Pin, PinOff, ShieldBan } from 'lucide-react'
import { RestrictUserDialog } from '@/features/community-bans/components/RestrictUserDialog'
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
  author,
}: {
  postId: string
  communityId: string
  isPinned: boolean
  isLocked: boolean
  /** The post's author, when a moderator should be offered to restrict them. */
  author?: { id: string; name: string } | null
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
      {author && (
        <RestrictUserDialog
          communityId={communityId}
          userId={author.id}
          userName={author.name}
          trigger={
            <button type="button" className="flex items-center gap-1 hover:text-danger">
              <ShieldBan className="h-3.5 w-3.5" /> Restrict author
            </button>
          }
        />
      )}
    </div>
  )
}
