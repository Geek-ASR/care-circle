import { Stethoscope } from 'lucide-react'
import { cn } from '@/utils/cn'

export function MedicalDisclaimer({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        'flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4',
        className,
      )}
    >
      <Stethoscope className="h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
      <p className="text-sm text-foreground">
        <strong className="font-semibold">This isn&apos;t a diagnosis.</strong> These
        results are a rough pattern-match based on the symptoms you pick, not a medical
        assessment, and they can easily be wrong. If you&apos;re dealing with new,
        worsening, or concerning symptoms, please talk to a doctor. CareCircle exists to
        help you find people who understand what you&apos;re going through and communities
        to share experiences with — not to replace professional care.
      </p>
    </div>
  )
}
