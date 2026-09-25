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
        <MessageCircle className="h-[18px] w-[18px]" />
        {totalUnread > 0 && (
          <Badge className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] justify-center bg-secondary px-1 text-[10px] font-bold text-secondary-foreground ring-2 ring-background">
            {totalUnread > 9 ? '9+' : totalUnread}
          </Badge>
        )}
      </Link>
    </Button>
  )
}
