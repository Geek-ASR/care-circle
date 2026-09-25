import { Skeleton } from '@/components/ui'
import { useCommunityRules } from '../../hooks/useCommunities'
import { useRuleMutations } from '../../hooks/useCommunitySettings'
import { EditableItemList } from './EditableItemList'

const FIELDS = [
  {
    key: 'title',
    label: 'Rule',
    placeholder: 'e.g. Share experience, not prescriptions',
    required: true,
    maxLength: 120,
  },
  {
    key: 'description',
    label: 'Details',
    placeholder: 'Explain what this rule means in practice',
    multiline: true,
    maxLength: 500,
  },
]

export function RulesEditor({ communityId }: { communityId: string }) {
  const { data: rules, isLoading } = useCommunityRules(communityId)
  const { create, update, remove, reorder } = useRuleMutations(communityId)

  if (isLoading) return <Skeleton className="h-32 rounded-xl" />

  const toInput = (v: Record<string, string>) => ({
    title: (v.title ?? '').trim(),
    description: v.description?.trim() || null,
  })

  return (
    <EditableItemList
      items={rules ?? []}
      fields={FIELDS}
      toValues={(rule) => ({ title: rule.title, description: rule.description ?? '' })}
      renderItem={(rule, index) => (
        <div className="flex gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{rule.title}</p>
            {rule.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{rule.description}</p>
            )}
          </div>
        </div>
      )}
      onCreate={(v) =>
        create.mutateAsync({ input: toInput(v), position: rules?.length ?? 0 })
      }
      onUpdate={(id, v) => update.mutateAsync({ id, input: toInput(v) })}
      onDelete={(id) => remove.mutateAsync(id)}
      onReorder={(ids) => reorder.mutateAsync(ids)}
      addLabel="Add rule"
      emptyText="No rules yet. Clear rules help keep a support community kind and safe."
    />
  )
}
