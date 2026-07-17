import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToTable } from '@/services/realtime'
import { queryKeys } from '@/services/queryClient'
import type { Message } from '@/types/database'
import {
  getConversationParticipants,
  getOrCreateDirectConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
} from '../api/chat'

export function useConversations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id

  const query = useQuery({
    queryKey: userId ? queryKeys.conversations(userId) : ['conversations', 'signed-out'],
    queryFn: () => listConversations(userId as string),
    enabled: Boolean(userId),
  })

  useEffect(() => {
    if (!userId) return
    // messages has no recipient column to filter on, so we subscribe to every
    // insert and let the refetch settle which conversations actually changed.
    return subscribeToTable<Message>(
      `conversations:${userId}`,
      { table: 'messages', event: 'INSERT' },
      () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.conversations(userId) })
      },
    )
  }, [userId, queryClient])

  const totalUnread = (query.data ?? []).reduce((sum, c) => sum + c.unreadCount, 0)

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    totalUnread,
  }
}

export function useConversationMessages(conversationId: string | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: conversationId
      ? queryKeys.conversationMessages(conversationId)
      : ['conversations', 'none', 'messages'],
    queryFn: () => listMessages(conversationId as string),
    enabled: Boolean(conversationId),
  })

  useEffect(() => {
    if (!conversationId) return
    return subscribeToTable<Message>(
      `messages:${conversationId}`,
      { table: 'messages', event: 'INSERT', filter: `conversation_id=eq.${conversationId}` },
      () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversationMessages(conversationId),
        })
        if (user?.id) {
          void queryClient.invalidateQueries({ queryKey: queryKeys.conversations(user.id) })
        }
      },
    )
  }, [conversationId, queryClient, user?.id])

  // Mark read whenever the thread is open and messages have loaded/changed.
  useEffect(() => {
    if (!conversationId || !user?.id || !query.data || query.data.length === 0) return
    void markConversationRead(conversationId, user.id).then(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations(user.id) })
    })
  }, [conversationId, user?.id, query.data, queryClient])

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
  }
}

export function useConversationParticipants(conversationId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: conversationId
      ? ['conversations', conversationId, 'participants']
      : ['conversations', 'none', 'participants'],
    queryFn: () => getConversationParticipants(conversationId as string, user!.id),
    enabled: Boolean(conversationId && user?.id),
  })
}

export function useSendMessage(conversationId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: string) => sendMessage(conversationId, user!.id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversationMessages(conversationId),
      })
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.conversations(user.id) })
      }
    },
  })
}

export function useStartConversation() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (otherUserId: string) => getOrCreateDirectConversation(otherUserId),
    onSuccess: (conversationId) => {
      navigate(`/messages/${conversationId}`)
    },
  })
}
