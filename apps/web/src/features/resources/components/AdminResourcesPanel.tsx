import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui'
import { ConditionSelect } from '@/features/conditions/components/ConditionSelect'
import {
  useConditionResources,
  useCreateConditionResource,
  useDeleteConditionResource,
} from '../hooks/useResources'
import type { ResourceCategory } from '@/types/database'

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  hotline: 'Hotline',
  organization: 'Organization',
  research: 'Research',
  financial_assistance: 'Financial assistance',
  other: 'Other',
}

export function AdminResourcesPanel() {
  const [conditionId, setConditionId] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ResourceCategory | ''>('')

  const { data: resources, isLoading } = useConditionResources(conditionId || undefined)
  const createResource = useCreateConditionResource()
  const deleteResource = useDeleteConditionResource(conditionId)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!conditionId || !title.trim()) return
    await createResource.mutateAsync({ conditionId, title, url, description, category })
    setTitle('')
    setUrl('')
    setDescription('')
    setCategory('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="resource-condition">Condition</Label>
        <ConditionSelect
          id="resource-condition"
          value={conditionId}
          onValueChange={setConditionId}
          placeholder="Choose a condition"
          className="max-w-xs"
        />
      </div>

      {conditionId && (
        <>
          <form
            onSubmit={(e) => void handleAdd(e)}
            className="flex flex-col gap-3 rounded-lg border border-border p-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="resource-title">Title</Label>
              <Input
                id="resource-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="resource-url">URL (optional)</Label>
              <Input
                id="resource-url"
                type="url"
                placeholder="https://"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="resource-description">Description (optional)</Label>
              <Input
                id="resource-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="resource-category">Category (optional)</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ResourceCategory)}
              >
                <SelectTrigger id="resource-category" className="max-w-xs">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              size="sm"
              className="self-start"
              disabled={!title.trim() || createResource.isPending}
            >
              {createResource.isPending ? 'Adding…' : 'Add resource'}
            </Button>
          </form>

          {isLoading && <Skeleton className="h-16" />}

          {!isLoading && resources && resources.length > 0 && (
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between gap-2 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {resource.title}
                    </p>
                    {resource.url && (
                      <p className="truncate text-xs text-muted-foreground">
                        {resource.url}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleteResource.isPending}
                    onClick={() => deleteResource.mutate(resource.id)}
                    aria-label={`Remove ${resource.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
