import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, Button, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import {
  useConversationMessages,
  useConversationParticipants,
  useSendMessage,
} from '@/features/chat/hooks/useChat'
import { MessageBubble } from '@/features/chat/components/MessageBubble'
import { MessageComposer } from '@/features/chat/components/MessageComposer'

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user } = useAuth()
  const { messages, isLoading } = useConversationMessages(conversationId)
  const { data: participants } = useConversationParticipants(conversationId)
  const sendMessage = useSendMessage(conversationId as string)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  const other = participants?.[0]
  const name = other?.display_name ?? other?.username ?? 'Conversation'
  const initials = name.charAt(0).toUpperCase()

  return (
    <div className="mx-auto flex h-[calc(100svh-3.5rem)] max-w-2xl flex-col">
      <Helmet>
        <title>{name} · Messages · CareCircle</title>
      </Helmet>

      <div className="flex items-center gap-2 border-b border-border px-3 py-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link to="/messages" aria-label="Back to messages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        {other && (
          <Link to={`/u/${other.username}`} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={other.avatar_url ?? undefined} alt="" />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">{name}</span>
          </Link>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="ml-auto h-10 w-2/3" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Say hello to start the conversation.
          </p>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === user?.id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageComposer
        onSend={(body) => sendMessage.mutate(body)}
        isSending={sendMessage.isPending}
      />
    </div>
  )
}
