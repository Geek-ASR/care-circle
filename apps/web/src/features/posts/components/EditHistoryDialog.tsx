import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { History } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Skeleton,
} from '@/components/ui'
import { MarkdownContent } from '@/components/MarkdownContent'
import { listPostVersions } from '../api/posts'

interface CurrentVersion {
  createdAt: string
  title: string
  body: string | null
  editedAt: string | null
}

/**
 * Shows every saved revision of a post. Each post_versions row stores the content
 * as it was *before* an edit, so a row's own timestamp is when that content was
 * replaced; the version it replaced begins at the previous row's timestamp.
 */
export function EditHistoryDialog({
  postId,
  current,
}: {
  postId: string
  current: CurrentVersion
}) {
  const [open, setOpen] = useState(false)
  const { data: versions, isLoading } = useQuery({
    queryKey: ['post-versions', postId],
    queryFn: () => listPostVersions(postId),
    enabled: open,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <History className="h-3.5 w-3.5" aria-hidden="true" /> Edit history
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85svh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit history</DialogTitle>
          <DialogDescription>
            Only the author and community moderators can see previous versions.
          </DialogDescription>
        </DialogHeader>

        <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
          <VersionEntry
            label="Current version"
            date={current.editedAt}
            title={current.title}
            body={current.body}
            highlight
          />
          {isLoading && <Skeleton className="h-24 rounded-xl" />}
          {versions?.map((version, i) => (
            <VersionEntry
              key={version.id}
              label={
                i === versions.length - 1 ? 'Original' : `Revision ${versions.length - i}`
              }
              date={versions[i + 1]?.created_at ?? current.createdAt}
              replacedAt={version.created_at}
              title={version.title ?? ''}
              body={version.body}
            />
          ))}
          {versions?.length === 0 && (
            <li className="text-sm text-muted-foreground">
              No earlier versions were saved.
            </li>
          )}
        </ol>
      </DialogContent>
    </Dialog>
  )
}

function VersionEntry({
  label,
  date,
  replacedAt,
  title,
  body,
  highlight,
}: {
  label: string
  date: string | null
  replacedAt?: string
  title: string
  body: string | null
  highlight?: boolean
}) {
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-surface-raised ${
          highlight ? 'bg-primary' : 'bg-border-strong'
        }`}
      />
      <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{label}</span>
        {date && <span>from {format(new Date(date), 'MMM d, yyyy · h:mm a')}</span>}
        {replacedAt && (
          <span>until {format(new Date(replacedAt), 'MMM d, yyyy · h:mm a')}</span>
        )}
      </div>
      <div className="mt-2 rounded-xl border border-border bg-surface p-4">
        <p className="font-display font-semibold text-foreground">{title}</p>
        {body ? (
          <MarkdownContent content={body} className="mt-2 text-sm" />
        ) : (
          <p className="mt-1 text-sm italic text-muted-foreground">No body</p>
        )}
      </div>
    </li>
  )
}
