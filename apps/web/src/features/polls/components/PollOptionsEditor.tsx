import { Plus, X } from 'lucide-react'
import { Button, Input, Label } from '@/components/ui'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

export function PollOptionsEditor({
  options,
  onChange,
}: {
  options: string[]
  onChange: (options: string[]) => void
}) {
  function updateOption(index: number, value: string) {
    onChange(options.map((option, i) => (i === index ? value : option)))
  }

  function addOption() {
    if (options.length >= MAX_OPTIONS) return
    onChange([...options, ''])
  }

  function removeOption(index: number) {
    if (options.length <= MIN_OPTIONS) return
    onChange(options.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Poll options</Label>
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              maxLength={120}
              aria-label={`Poll option ${index + 1}`}
            />
            {options.length > MIN_OPTIONS && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(index)}
                aria-label={`Remove option ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      {options.length < MAX_OPTIONS && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={addOption}
        >
          <Plus className="h-4 w-4" /> Add option
        </Button>
      )}
    </div>
  )
}
