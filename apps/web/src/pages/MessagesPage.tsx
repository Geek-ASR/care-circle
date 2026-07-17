import { Helmet } from 'react-helmet-async'
import { MessageCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useConversations } from '@/features/chat/hooks/useChat'
import { ConversationListItem } from '@/features/chat/components/ConversationListItem'

export default function MessagesPage() {
  const { conversations, isLoading } = useConversations()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Helmet>
        <title>Messages · CareCircle</title>
      </Helmet>
      <h1 className="text-xl font-semibold text-foreground">Messages</h1>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}

      {!isLoading && conversations.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <MessageCircle className="h-8 w-8" aria-hidden="true" />
          <p className="text-sm">
            No conversations yet. Visit someone&apos;s profile and tap Message to start one.
          </p>
        </div>
      )}

      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {conversations.map((conversation) => (
          <ConversationListItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </div>
  )
}
