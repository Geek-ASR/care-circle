import { describe, expect, it } from 'vitest'
import type { NotificationWithActor } from '../api/notifications'
import { notificationHref, notificationMessage } from './format'

function make(overrides: Partial<NotificationWithActor>): NotificationWithActor {
  return {
    id: 'n1',
    user_id: 'u1',
    actor_id: null,
    type: 'reply',
    target_type: null,
    target_id: null,
    is_read: false,
    created_at: '2026-01-01T00:00:00Z',
    actor: null,
    ...overrides,
  } as NotificationWithActor
}

describe('notification formatting', () => {
  it('names the actor when there is one', () => {
    const n = make({
      type: 'follow',
      actor: { username: 'maya', display_name: 'Maya' } as never,
    })
    expect(notificationMessage(n)).toBe('Maya started following you')
  })

  it('describes community restrictions without naming a moderator', () => {
    const n = make({
      type: 'moderator_message',
      target_type: 'community',
      target_id: 'c1',
    })
    expect(notificationMessage(n)).toBe('Moderators changed your access to a community')
    expect(notificationHref(n)).toBe('/community/c1')
  })

  it('links posts and falls back to the notifications page', () => {
    expect(notificationHref(make({ target_type: 'post', target_id: 'p1' }))).toBe(
      '/posts/p1',
    )
    expect(notificationHref(make({}))).toBe('/notifications')
  })
})
