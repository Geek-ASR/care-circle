import { useState } from 'react'
import { Flag } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/store/toastStore'
import type { ReportReason, ReportTargetType } from '@/types/database'
import { useCreateReport } from '../hooks/useReports'

const REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  abuse: 'Abusive or hateful content',
  harassment: 'Harassment or bullying',
  misinformation: 'Misinformation',
  medical_misinformation: 'Medical misinformation',
  violence: 'Violence or threats',
  self_harm: 'Self-harm or suicide risk',
  scam: 'Scam or fraud',
  other: 'Other',
}

interface ReportDialogProps {
  targetType: ReportTargetType
  targetId: string
}

export function ReportDialog({ targetType, targetId }: ReportDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [description, setDescription] = useState('')
  const createReport = useCreateReport()

  function handleTriggerClick() {
    if (!user) {
      toast({ title: 'Sign in to report content' })
      return
    }
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !reason) return

    await createReport.mutateAsync({
      reporterId: user.id,
      targetType,
      targetId,
      reason,
      description,
    })
    setOpen(false)
    setReason('')
    setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={handleTriggerClick}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-danger"
      >
        <Flag className="h-3.5 w-3.5" /> Report
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this {targetType}</DialogTitle>
          <DialogDescription>
            Reports are sent to community moderators for review. Nobody is notified that
            you reported them.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-reason">Reason</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
              <SelectTrigger id="report-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REASON_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-description">Additional details (optional)</Label>
            <Textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anything that will help a moderator review this"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={!reason || createReport.isPending}
            >
              {createReport.isPending ? 'Submitting…' : 'Submit report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
