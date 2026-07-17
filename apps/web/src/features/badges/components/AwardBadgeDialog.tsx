import { useState } from 'react'
import { Award } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useAllBadges, useAwardBadge, useUserBadges } from '../hooks/useBadges'

export function AwardBadgeDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [badgeId, setBadgeId] = useState('')
  const { data: allBadges } = useAllBadges()
  const { data: userBadges } = useUserBadges(userId)
  const awardBadge = useAwardBadge(userId)

  const alreadyAwardedIds = new Set((userBadges ?? []).map((ub) => ub.badge_id))
  const availableBadges = (allBadges ?? []).filter((b) => !alreadyAwardedIds.has(b.id))

  async function handleAward() {
    if (!badgeId) return
    await awardBadge.mutateAsync(badgeId)
    setBadgeId('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Award className="h-4 w-4" /> Award badge
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Award a badge</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="badge">Badge</Label>
          <Select value={badgeId} onValueChange={setBadgeId}>
            <SelectTrigger id="badge">
              <SelectValue placeholder="Choose a badge" />
            </SelectTrigger>
            <SelectContent>
              {availableBadges.map((badge) => (
                <SelectItem key={badge.id} value={badge.id}>
                  {badge.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {availableBadges.length === 0 && (
            <p className="text-xs text-muted-foreground">
              This user already has every badge.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!badgeId || awardBadge.isPending}
            onClick={() => void handleAward()}
          >
            {awardBadge.isPending ? 'Awarding…' : 'Award'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
