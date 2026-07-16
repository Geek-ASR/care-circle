import type { Community, CommunityMemberRole } from '@/types/database'

export interface CommunityWithCondition extends Community {
  condition: { name: string; slug: string } | null
}

export interface MyCommunity extends Community {
  membershipRole: CommunityMemberRole
}
