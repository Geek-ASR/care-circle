import { cn } from '@/utils/cn'
import { useTags } from '../hooks/useTags'

export function TagPicker({
  selectedTagIds,
  onChange,
}: {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
}) {
  const { data: tags, isLoading } = useTags()

  function toggle(tagId: string) {
    onChange(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId],
    )
  }

  if (isLoading) return null

  return (
    <fieldset className="flex flex-wrap gap-2 border-0 p-0">
      <legend className="sr-only">Tags</legend>
      {tags?.map((tag) => {
        const selected = selectedTagIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(tag.id)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
              selected
                ? 'border-primary/50 bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:bg-surface-hover',
            )}
          >
            {tag.name}
          </button>
        )
      })}
    </fieldset>
  )
}
