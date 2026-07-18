import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import { cn } from '@/utils/cn'
import type { SymptomCheckAnswers } from '@/types/database'
import { DURATION_OPTIONS, PATTERN_OPTIONS } from '../constants'

const SEVERITY_LABELS = ['Mild', 'Mild-moderate', 'Moderate', 'Moderate-severe', 'Severe']

interface FollowUpQuestionsProps {
  answers: SymptomCheckAnswers
  onChange: (answers: SymptomCheckAnswers) => void
}

export function FollowUpQuestions({ answers, onChange }: FollowUpQuestionsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="duration">How long has this been going on?</Label>
        <Select
          value={answers.duration}
          onValueChange={(value) => onChange({ ...answers, duration: value })}
        >
          <SelectTrigger id="duration" className="max-w-xs">
            <SelectValue placeholder="Select one" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>How would you rate the severity?</Label>
        <div className="flex max-w-xs gap-2">
          {SEVERITY_LABELS.map((label, i) => {
            const value = i + 1
            const active = answers.severity === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                aria-label={`Severity ${value}: ${label}`}
                onClick={() => onChange({ ...answers, severity: value })}
                className={cn(
                  'flex-1 rounded-md border py-2 text-xs font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-surface text-muted-foreground hover:bg-surface-hover',
                )}
              >
                {value}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {SEVERITY_LABELS[(answers.severity || 1) - 1]}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pattern">What&apos;s the pattern?</Label>
        <Select
          value={answers.pattern}
          onValueChange={(value) => onChange({ ...answers, pattern: value })}
        >
          <SelectTrigger id="pattern" className="max-w-xs">
            <SelectValue placeholder="Select one" />
          </SelectTrigger>
          <SelectContent>
            {PATTERN_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Anything else worth mentioning? (optional)</Label>
        <Textarea
          id="notes"
          value={answers.notes}
          onChange={(e) => onChange({ ...answers, notes: e.target.value })}
          placeholder="E.g. what makes it better or worse, when it started..."
        />
      </div>
    </div>
  )
}
