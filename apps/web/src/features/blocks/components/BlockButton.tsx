import { Ban } from 'lucide-react'
import { Button } from '@/components/ui'
import { useIsBlocked, useToggleBlock } from '../hooks/useBlocks'

export function BlockButton({ userId }: { userId: string }) {
  const { data: blocked, isLoading } = useIsBlocked(userId)
  const toggle = useToggleBlock(userId)

  return (
    <Button
      size="sm"
      variant={blocked ? 'danger' : 'ghost'}
      disabled={isLoading || toggle.isPending}
      onClick={() => toggle.mutate(Boolean(blocked))}
    >
      <Ban className="h-4 w-4" /> {blocked ? 'Unblock' : 'Block'}
    </Button>
  )
}
