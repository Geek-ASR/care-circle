import { Helmet } from 'react-helmet-async'
import { MessageCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useConversations } from '@/features/chat/hooks/useChat'
import { ConversationListItem } from '@/features/chat/components/ConversationListItem'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'

export default function MessagesPage() {
  const { conversations, isLoading } = useConversations()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Helmet>
        <title>Messages · CareCircle</title>
      </Helmet>
      <PageHeader
        icon={MessageCircle}
        title="Messages"
        description="Private conversations with people in your communities."
      />

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      )}

      {!isLoading && conversations.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          description="Visit someone's profile and tap Message to start a private conversation."
        />
      )}

      {conversations.length > 0 && (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
          {conversations.map((conversation) => (
            <ConversationListItem key={conversation.id} conversation={conversation} />
          ))}
        </div>
      )}
    </div>
  )
}
