import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ExternalLink, FilePlus2, Trash2 } from 'lucide-react'
import { Button, Input, Label, Skeleton } from '@/components/ui'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { cn } from '@/utils/cn'
import type { WikiPage } from '@/types/database'
import { slugify } from '../../schemas'
import { useWikiPages } from '../../hooks/useCommunities'
import { useWikiMutations } from '../../hooks/useCommunitySettings'

function WikiPageForm({
  page,
  communitySlug,
  onSaved,
  onDeleted,
  save,
  remove,
}: {
  page: WikiPage | null
  communitySlug: string
  onSaved: (slug: string) => void
  onDeleted: () => void
  save: (input: { title: string; slug: string; content: string }) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
}) {
  const [title, setTitle] = useState(page?.title ?? '')
  const [slug, setSlug] = useState(page?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(page))
  const [content, setContent] = useState(page?.content ?? '')
  const [saving, setSaving] = useState(false)

  const effectiveSlug = slugTouched ? slugify(slug) : slugify(title)
  const canSave = title.trim().length >= 2 && effectiveSlug.length > 0 && !saving

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
          await save({ title: title.trim(), slug: effectiveSlug, content })
          onSaved(effectiveSlug)
        } catch {
          /* toast already shown by the mutation */
        } finally {
          setSaving(false)
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wiki-title">Title</Label>
          <Input
            id="wiki-title"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Newly diagnosed? Start here"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wiki-slug">Page address</Label>
          <Input
            id="wiki-slug"
            value={slugTouched ? slug : effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            placeholder="start-here"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-subtle-foreground">
        /r/{communitySlug}/wiki/{effectiveSlug || '…'}
      </p>

      <div className="flex flex-col gap-1.5">
        <Label>Content</Label>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          minRows={14}
          placeholder="Write in Markdown — headings, lists and links are supported."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {page ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={`/r/${communitySlug}/wiki/${page.slug}`}>
                <ExternalLink className="h-4 w-4" /> View page
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:text-danger"
              onClick={async () => {
                if (!window.confirm(`Delete "${page.title}"? This cannot be undone.`))
                  return
                await remove(page.id)
                onDeleted()
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={!canSave}>
          {saving ? 'Saving…' : page ? 'Save page' : 'Create page'}
        </Button>
      </div>
      {page && (
        <p className="text-xs text-subtle-foreground">
          Version {page.version} · last updated{' '}
          {new Date(page.updated_at).toLocaleString()}
        </p>
      )}
    </form>
  )
}

export function WikiEditor({
  communityId,
  communitySlug,
  initialPageSlug,
}: {
  communityId: string
  communitySlug: string
  initialPageSlug?: string | null
}) {
  const { data: pages, isLoading } = useWikiPages(communityId)
  const { create, update, remove } = useWikiMutations(communityId)
  const [selected, setSelected] = useState<string | 'new' | null>(initialPageSlug ?? null)

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />

  const current =
    selected && selected !== 'new'
      ? (pages?.find((p) => p.slug === selected) ?? null)
      : null
  const showForm = selected === 'new' || current !== null

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Wiki pages" className="flex flex-col gap-1">
        <Button
          type="button"
          variant={selected === 'new' ? 'soft' : 'outline'}
          size="sm"
          className="mb-2 justify-start"
          onClick={() => setSelected('new')}
        >
          <FilePlus2 className="h-4 w-4" /> New page
        </Button>
        {pages?.length === 0 && (
          <p className="px-2 text-xs text-muted-foreground">No pages yet.</p>
        )}
        {pages?.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => setSelected(page.slug)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
              selected === page.slug
                ? 'bg-primary/10 font-medium text-foreground'
                : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
            )}
          >
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{page.title}</span>
          </button>
        ))}
      </nav>

      <div className="min-w-0">
        {showForm ? (
          <WikiPageForm
            // Remount per page so local form state resets when switching pages.
            key={current?.id ?? 'new'}
            page={current}
            communitySlug={communitySlug}
            save={(input) =>
              current
                ? update.mutateAsync({ page: current, input })
                : create.mutateAsync(input)
            }
            remove={(id) => remove.mutateAsync(id)}
            onSaved={(slug) => setSelected(slug)}
            onDeleted={() => setSelected(null)}
          />
        ) : (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong/70 p-8 text-center">
            <BookOpen className="h-6 w-6 text-subtle-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Pick a page to edit, or create a new one. Wiki pages are great for FAQs,
              “start here” guides and treatment overviews.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
