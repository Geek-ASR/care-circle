import { useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, Input, Label, Textarea } from '@/components/ui'

export interface FieldConfig {
  key: string
  label: string
  placeholder?: string
  multiline?: boolean
  required?: boolean
  type?: 'text' | 'url'
  maxLength?: number
}

type Values = Record<string, string>

interface EditableItemListProps<T extends { id: string }> {
  items: T[]
  fields: FieldConfig[]
  /** Maps an existing item to form values when editing it. */
  toValues: (item: T) => Values
  renderItem: (item: T, index: number) => React.ReactNode
  onCreate: (values: Values) => Promise<unknown>
  onUpdate: (id: string, values: Values) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
  /** When provided, rows get move up/down controls. */
  onReorder?: (orderedIds: string[]) => Promise<unknown>
  addLabel: string
  emptyText: string
}

function emptyValues(fields: FieldConfig[]): Values {
  return Object.fromEntries(fields.map((f) => [f.key, '']))
}

function ItemForm({
  fields,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  fields: FieldConfig[]
  initial: Values
  submitLabel: string
  onSubmit: (values: Values) => Promise<unknown>
  onCancel: () => void
}) {
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)
  const missingRequired = fields.some((f) => f.required && !values[f.key]?.trim())

  return (
    <form
      className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-surface-sunken p-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
          await onSubmit(values)
          onCancel()
        } catch {
          /* the mutation's onError already surfaced a toast; keep the form open */
        } finally {
          setSaving(false)
        }
      }}
    >
      {fields.map((field) => {
        const id = `field-${field.key}`
        const common = {
          id,
          value: values[field.key] ?? '',
          placeholder: field.placeholder,
          maxLength: field.maxLength,
          required: field.required,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setValues((v) => ({ ...v, [field.key]: e.target.value })),
        }
        return (
          <div key={field.key} className="flex flex-col gap-1.5">
            <Label htmlFor={id}>
              {field.label}
              {!field.required && (
                <span className="ml-1 font-normal text-subtle-foreground">
                  (optional)
                </span>
              )}
            </Label>
            {field.multiline ? (
              <Textarea {...common} className="min-h-20" />
            ) : (
              <Input {...common} type={field.type ?? 'text'} />
            )}
          </div>
        )
      })}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving || missingRequired}>
          {saving ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

/** Add / edit / delete / reorder UI shared by the rules and resources editors. */
export function EditableItemList<T extends { id: string }>({
  items,
  fields,
  toValues,
  renderItem,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
  addLabel,
  emptyText,
}: EditableItemListProps<T>) {
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)

  function move(index: number, direction: -1 | 1) {
    if (!onReorder) return
    const ids = items.map((i) => i.id)
    const target = index + direction
    if (target < 0 || target >= ids.length) return
    ;[ids[index], ids[target]] = [ids[target]!, ids[index]!]
    void onReorder(ids)
  }

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && editingId !== 'new' && (
        <p className="rounded-xl border border-dashed border-border-strong/70 px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      )}

      <ol className="flex flex-col gap-2">
        {items.map((item, index) =>
          editingId === item.id ? (
            <li key={item.id}>
              <ItemForm
                fields={fields}
                initial={toValues(item)}
                submitLabel="Save"
                onSubmit={(values) => onUpdate(item.id, values)}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li
              key={item.id}
              className="group flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
              <div className="flex shrink-0 items-center gap-0.5">
                {onReorder && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Move down"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Edit"
                  onClick={() => setEditingId(item.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-danger"
                  aria-label="Delete"
                  onClick={() => {
                    if (window.confirm('Delete this item? This cannot be undone.')) {
                      void onDelete(item.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ),
        )}
      </ol>

      {editingId === 'new' ? (
        <ItemForm
          fields={fields}
          initial={emptyValues(fields)}
          submitLabel={addLabel}
          onSubmit={onCreate}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setEditingId('new')}
        >
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      )}
    </div>
  )
}
