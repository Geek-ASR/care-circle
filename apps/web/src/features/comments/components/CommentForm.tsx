import { useState } from 'react'
import { Button } from '@/components/ui'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { useAuth } from '@/contexts/AuthContext'
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
  const createComment = useCreateComment(postId)

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">Sign in to join the conversation.</p>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    await createComment.mutateAsync({
      authorId: user!.id,
      parentCommentId,
      body: body.trim(),
    })
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
