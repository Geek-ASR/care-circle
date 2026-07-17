import { useId } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'

const STARS = [1, 2, 3, 4, 5]

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}

/** Interactive when `onChange` is passed, otherwise a read-only display. */
export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const name = useId()
  const dimension = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'

  if (!onChange) {
    return (
      <span aria-label={`${value} out of 5 stars`} className="flex items-center gap-0.5">
        {STARS.map((star) => (
          <Star
            key={star}
            aria-hidden="true"
            className={cn(
              dimension,
              star <= value ? 'fill-warning text-warning' : 'text-border',
            )}
          />
        ))}
      </span>
    )
  }

  return (
    <fieldset className="flex items-center gap-0.5 border-0 p-0">
      <legend className="sr-only">Rating</legend>
      {STARS.map((star) => (
        <label
          key={star}
          className="cursor-pointer rounded-sm has-focus-visible:ring-2 has-focus-visible:ring-ring"
        >
          <input
            type="radio"
            name={name}
            value={star}
            checked={star === value}
            onChange={() => onChange(star)}
            className="sr-only"
          />
          <Star
            className={cn(
              dimension,
              star <= value ? 'fill-warning text-warning' : 'text-border',
            )}
          />
        </label>
      ))}
    </fieldset>
  )
}
