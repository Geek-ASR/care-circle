import { Bookmark } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import { useIsBookmarked, useToggleBookmark } from '../hooks/useBookmarks'

export function BookmarkButton({
  postId,
  size = 'md',
}: {
  postId: string
  size?: 'sm' | 'md'
}) {
  const { user } = useAuth()
  const { data: isBookmarked } = useIsBookmarked(postId)
  const toggle = useToggleBookmark(postId)

  function handleClick() {
    if (!user) {
      toast({ title: 'Sign in to save posts' })
      return
    }
    toggle.mutate(Boolean(isBookmarked))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-pressed={Boolean(isBookmarked)}
      className={cn(
        'flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground',
        size === 'sm' ? 'text-xs' : 'text-sm',
        isBookmarked && 'text-primary hover:text-primary',
      )}
    >
      <Bookmark
        className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}
        fill={isBookmarked ? 'currentColor' : 'none'}
      />
      {isBookmarked ? 'Saved' : 'Save'}
    </button>
  )
}
