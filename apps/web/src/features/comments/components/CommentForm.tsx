import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { useAuth } from '@/contexts/AuthContext'
import { describeWriteError } from '@/utils/errors'
import { useCreateComment } from '../hooks/useComments'

interface CommentFormProps {
  postId: string
  parentCommentId?: string | null
  onDone?: () => void
  autoFocus?: boolean
  placeholder?: string
}

export function CommentForm({
  postId,
  parentCommentId = null,
  onDone,
  placeholder = 'What are your thoughts?',
}: CommentFormProps) {
  const { user } = useAuth()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createComment = useCreateComment(postId)

  if (!user) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong/70 px-4 py-3 text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>{' '}
        to join the conversation.
      </p>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setError(null)
    try {
      await createComment.mutateAsync({
        authorId: user!.id,
        parentCommentId,
        body: body.trim(),
      })
    } catch (err) {
      setError(
        describeWriteError(
          err,
          'Your comment could not be posted. Please try again.',
          "You can't comment here right now — this post may be locked, or you may be muted in this community.",
        ),
      )
      return
    }
    setBody('')
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <MarkdownEditor
        value={body}
        onChange={setBody}
        placeholder={placeholder}
        minRows={3}
      />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Button
        type="submit"
        size="sm"
        className="self-end"
        disabled={!body.trim() || createComment.isPending}
      >
        {createComment.isPending ? 'Posting…' : 'Comment'}
      </Button>
    </form>
  )
}
