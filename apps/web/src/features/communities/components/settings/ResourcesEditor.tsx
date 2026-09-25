import { ExternalLink } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useCommunityResources } from '../../hooks/useCommunities'
import { useResourceMutations } from '../../hooks/useCommunitySettings'
import { EditableItemList } from './EditableItemList'

const FIELDS = [
  {
    key: 'title',
    label: 'Title',
    placeholder: 'e.g. Lupus Foundation of America',
    required: true,
    maxLength: 140,
  },
  { key: 'url', label: 'Link', placeholder: 'https://…', type: 'url' as const },
  {
    key: 'description',
    label: 'Description',
    placeholder: 'Why is this useful?',
    multiline: true,
    maxLength: 400,
  },
]

export function ResourcesEditor({ communityId }: { communityId: string }) {
  const { data: resources, isLoading } = useCommunityResources(communityId)
  const { create, update, remove } = useResourceMutations(communityId)

  if (isLoading) return <Skeleton className="h-32 rounded-xl" />

  const toInput = (v: Record<string, string>) => ({
    title: (v.title ?? '').trim(),
    url: v.url?.trim() || null,
    description: v.description?.trim() || null,
  })

  return (
    <EditableItemList
      items={resources ?? []}
      fields={FIELDS}
      toValues={(r) => ({
        title: r.title,
        url: r.url ?? '',
        description: r.description ?? '',
      })}
      renderItem={(r) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            {r.url && <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />}
            <span className="truncate">{r.title}</span>
          </p>
          {r.url && <p className="truncate text-xs text-subtle-foreground">{r.url}</p>}
          {r.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{r.description}</p>
          )}
        </div>
      )}
      onCreate={(v) =>
        create.mutateAsync({ input: toInput(v), position: resources?.length ?? 0 })
      }
      onUpdate={(id, v) => update.mutateAsync({ id, input: toInput(v) })}
      onDelete={(id) => remove.mutateAsync(id)}
      addLabel="Add resource"
      emptyText="No resources yet. Link trusted organisations, guides or support lines."
    />
  )
}
