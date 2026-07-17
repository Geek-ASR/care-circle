export interface ChatParticipant {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export interface ConversationSummary {
  id: string
  is_group: boolean
  community_id: string | null
  last_message_at: string | null
  last_message_preview: string | null
  created_at: string
  otherParticipants: ChatParticipant[]
  unreadCount: number
}

export interface MessageWithSender {
  id: string
  conversation_id: string
  sender_id: string | null
  body: string | null
  attachment_url: string | null
  edited_at: string | null
  created_at: string
  sender: ChatParticipant | null
}
