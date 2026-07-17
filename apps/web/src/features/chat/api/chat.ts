import { supabase } from '@/services/supabaseClient'
import type { ChatParticipant, ConversationSummary, MessageWithSender } from '../types'

const PARTICIPANT_COLUMNS = 'id, username, display_name, avatar_url'

export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const { data: myRows, error: myRowsError } = await supabase
    .from('conversation_participants')
    .select(
      'conversation_id, conversations(id, is_group, community_id, last_message_at, last_message_preview, created_at)',
    )
    .eq('user_id', userId)
  if (myRowsError) throw myRowsError

  type Row = {
    conversation_id: string
    conversations: Omit<ConversationSummary, 'otherParticipants' | 'unreadCount'> | null
  }
  const rows = (myRows as unknown as Row[]).filter((row) => row.conversations !== null)
  if (rows.length === 0) return []

  const conversationIds = rows.map((row) => row.conversation_id)

  const [{ data: participantRows, error: participantsError }, { data: unreadRows, error: unreadError }] =
    await Promise.all([
      supabase
        .from('conversation_participants')
        .select(`conversation_id, user_id, profile:profiles!conversation_participants_user_id_fkey(${PARTICIPANT_COLUMNS})`)
        .in('conversation_id', conversationIds),
      supabase.rpc('get_unread_message_counts'),
    ])
  if (participantsError) throw participantsError
  if (unreadError) throw unreadError

  const otherParticipantsByConversation = new Map<string, ChatParticipant[]>()
  for (const row of participantRows as unknown as {
    conversation_id: string
    user_id: string
    profile: ChatParticipant | null
  }[]) {
    if (row.user_id === userId || !row.profile) continue
    const list = otherParticipantsByConversation.get(row.conversation_id) ?? []
    list.push(row.profile)
    otherParticipantsByConversation.set(row.conversation_id, list)
  }

  const unreadByConversation = new Map<string, number>(
    (unreadRows as { conversation_id: string; unread_count: number }[]).map((row) => [
      row.conversation_id,
      row.unread_count,
    ]),
  )

  return rows
    .map((row) => ({
      ...(row.conversations as Omit<ConversationSummary, 'otherParticipants' | 'unreadCount'>),
      otherParticipants: otherParticipantsByConversation.get(row.conversation_id) ?? [],
      unreadCount: unreadByConversation.get(row.conversation_id) ?? 0,
    }))
    .sort((a, b) => {
      const aTime = a.last_message_at ?? a.created_at
      const bTime = b.last_message_at ?? b.created_at
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
}

export async function getConversationParticipants(
  conversationId: string,
  currentUserId: string,
): Promise<ChatParticipant[]> {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select(`user_id, profile:profiles!conversation_participants_user_id_fkey(${PARTICIPANT_COLUMNS})`)
    .eq('conversation_id', conversationId)
  if (error) throw error

  return (data as unknown as { user_id: string; profile: ChatParticipant | null }[])
    .filter((row) => row.user_id !== currentUserId && row.profile)
    .map((row) => row.profile as ChatParticipant)
}

export async function listMessages(conversationId: string): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`*, sender:profiles!messages_sender_id_fkey(${PARTICIPANT_COLUMNS})`)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as unknown as MessageWithSender[]
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
  if (error) throw error
}

export async function markConversationRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function getOrCreateDirectConversation(otherUserId: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
    p_other_user_id: otherUserId,
  })
  if (error) throw error
  return data as string
}
