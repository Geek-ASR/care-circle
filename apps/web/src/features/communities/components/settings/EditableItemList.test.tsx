import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EditableItemList } from './EditableItemList'

const items = [
  { id: 'a', title: 'First' },
  { id: 'b', title: 'Second' },
  { id: 'c', title: 'Third' },
]

function renderList(overrides: Partial<Parameters<typeof EditableItemList>[0]> = {}) {
  const props = {
    items,
    fields: [{ key: 'title', label: 'Title', required: true }],
    toValues: (item: { title: string }) => ({ title: item.title }),
    renderItem: (item: { title: string }) => <span>{item.title}</span>,
    onCreate: vi
      .fn<(v: Record<string, string>) => Promise<unknown>>()
      .mockResolvedValue(undefined),
    onUpdate: vi
      .fn<(id: string, v: Record<string, string>) => Promise<unknown>>()
      .mockResolvedValue(undefined),
    onDelete: vi.fn<(id: string) => Promise<unknown>>().mockResolvedValue(undefined),
    onReorder: vi.fn<(ids: string[]) => Promise<unknown>>().mockResolvedValue(undefined),
    addLabel: 'Add item',
    emptyText: 'Nothing here',
    ...overrides,
  }
  render(<EditableItemList {...(props as Parameters<typeof EditableItemList>[0])} />)
  return props
}

describe('EditableItemList', () => {
  it('moves an item down by swapping it with the next one', async () => {
    const props = renderList()
    await userEvent.click(screen.getAllByRole('button', { name: 'Move down' })[0]!)
    expect(props.onReorder).toHaveBeenCalledWith(['b', 'a', 'c'])
  })

  it('disables moving the first item up and the last item down', () => {
    renderList()
    expect(screen.getAllByRole('button', { name: 'Move up' })[0]).toBeDisabled()
    expect(screen.getAllByRole('button', { name: 'Move down' })[2]).toBeDisabled()
  })

  it('creates an item from the add form and requires required fields', async () => {
    const props = renderList({ items: [] })
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add item' }))
    const submit = screen.getAllByRole('button', { name: 'Add item' }).at(-1)!
    expect(submit).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Title'), 'New rule')
    await userEvent.click(submit)
    expect(props.onCreate).toHaveBeenCalledWith({ title: 'New rule' })
  })
})
