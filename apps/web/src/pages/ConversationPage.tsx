import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, MessageCircleHeart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, Button, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import {
  useConversationMessages,
  useConversationParticipants,
  useSendMessage,
} from '@/features/chat/hooks/useChat'
import { MessageBubble } from '@/features/chat/components/MessageBubble'
import { MessageComposer } from '@/features/chat/components/MessageComposer'
import { useConversationRoom } from '@/features/chat/hooks/useConversationRoom'
import { avatarGradient } from '@/utils/avatarColor'

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user } = useAuth()
  const { messages, isLoading } = useConversationMessages(conversationId)
  const { data: participants } = useConversationParticipants(conversationId)
  const sendMessage = useSendMessage(conversationId as string)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { onlineIds, typingIds, notifyTyping, clearTyping } =
    useConversationRoom(conversationId)

  const lastMessage = messages[messages.length - 1]
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
    if (lastMessage?.sender_id) clearTyping(lastMessage.sender_id)
  }, [messages.length, lastMessage?.sender_id, clearTyping])

  const otherIsTyping = typingIds.length > 0
  useEffect(() => {
    if (otherIsTyping) bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [otherIsTyping])

  const other = participants?.[0]
  const name = other?.display_name ?? other?.username ?? 'Conversation'
  const initials = name.charAt(0).toUpperCase()
  const isOnline = Boolean(other && onlineIds.includes(other.id))

  return (
    <div className="mx-auto -mb-10 flex h-[calc(100svh-6.5rem)] max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xs lg:h-[calc(100svh-7rem)]">
      <Helmet>
        <title>{name} · Messages · CareCircle</title>
      </Helmet>

      <div className="flex items-center gap-3 border-b border-border px-3 py-3 sm:px-4">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link to="/messages" aria-label="Back to messages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        {other && (
          <Link to={`/u/${other.username}`} className="flex min-w-0 items-center gap-3">
            <span className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={other.avatar_url ?? undefined} alt="" />
                <AvatarFallback
                  className={`${avatarGradient(other.username)} text-sm font-semibold text-white`}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <span
                  className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success ring-2 ring-surface"
                  aria-hidden="true"
                />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {name}
              </span>
              <span className="block text-xs text-muted-foreground" aria-live="polite">
                {otherIsTyping ? (
                  <span className="text-primary">typing…</span>
                ) : isOnline ? (
                  'Online now'
                ) : (
                  `@${other.username}`
                )}
              </span>
            </span>
          </Link>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-surface-sunken/40 p-4 sm:p-5">
        {isLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-2/3 rounded-2xl" />
            <Skeleton className="ml-auto h-10 w-2/3 rounded-2xl" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="m-auto flex flex-col items-center gap-2 text-center">
            <MessageCircleHeart className="h-8 w-8 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Say hello 👋</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Messages are private between you and {name}.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === user?.id}
          />
        ))}

        {otherIsTyping && (
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-surface-raised px-3.5 py-3">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer
        onSend={(body) => sendMessage.mutate(body)}
        isSending={sendMessage.isPending}
        onTyping={notifyTyping}
      />
    </div>
  )
}
