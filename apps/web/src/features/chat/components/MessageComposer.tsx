import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button, Textarea } from '@/components/ui'

export function MessageComposer({
  onSend,
  isSending,
  onTyping,
}: {
  onSend: (body: string) => void
  isSending: boolean
  /** Fired on every edit; callers throttle it (see useConversationRoom). */
  onTyping?: () => void
}) {
  const [body, setBody] = useState('')

  function submit() {
    const trimmed = body.trim()
    if (!trimmed || isSending) return
    onSend(trimmed)
    setBody('')
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex items-end gap-2 border-t border-border bg-surface p-3"
    >
      <Textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value)
          if (e.target.value) onTyping?.()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        placeholder="Write a message…  (Enter to send, Shift+Enter for a new line)"
        className="min-h-11 flex-1 resize-none rounded-xl py-2.5"
        rows={1}
        aria-label="Message"
      />
      <Button
        type="submit"
        size="icon"
        className="h-11 w-11 rounded-xl"
        disabled={!body.trim() || isSending}
        aria-label="Send"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
