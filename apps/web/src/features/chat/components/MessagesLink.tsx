import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useConversations } from '../hooks/useChat'

export function MessagesLink() {
  const { user } = useAuth()
  const { totalUnread } = useConversations()

  if (!user) return null

  return (
    <Button asChild variant="ghost" size="icon" className="relative">
      <Link to="/messages" aria-label="Messages">
        <MessageCircle className="h-4 w-4" />
        {totalUnread > 0 && (
          <Badge
            variant="primary"
            className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1 text-[10px]"
          >
            {totalUnread > 9 ? '9+' : totalUnread}
          </Badge>
        )}
      </Link>
    </Button>
  )
}
