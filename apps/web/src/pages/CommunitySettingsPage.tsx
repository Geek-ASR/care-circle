import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ArrowLeft,
  BookOpen,
  LifeBuoy,
  ListOrdered,
  Settings2,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { useCommunity } from '@/features/communities/hooks/useCommunities'
import { useIsModeratorOfCommunity } from '@/features/moderation/hooks/useModeration'
import { CommunityDetailsForm } from '@/features/communities/components/settings/CommunityDetailsForm'
import { RulesEditor } from '@/features/communities/components/settings/RulesEditor'
import { ResourcesEditor } from '@/features/communities/components/settings/ResourcesEditor'
import { WikiEditor } from '@/features/communities/components/settings/WikiEditor'
import { MembersManager } from '@/features/community-bans/components/MembersManager'
import NotFoundPage from './NotFoundPage'

const TABS = ['general', 'members', 'rules', 'resources', 'wiki'] as const
type Tab = (typeof TABS)[number]

const cardClasses =
  'mt-5 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7'

export default function CommunitySettingsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: community, isLoading } = useCommunity(slug)
  const { isModerator, isLoading: isLoadingRole } = useIsModeratorOfCommunity(
    community?.id,
  )

  const requestedTab = searchParams.get('tab')
  const tab: Tab = TABS.find((t) => t === requestedTab) ?? 'general'

  if (isLoading || isLoadingRole) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (!community) return <NotFoundPage />

  if (!isModerator) {
    return (
      <div className="mx-auto max-w-xl pt-8">
        <EmptyState
          icon={ShieldAlert}
          title="Moderators only"
          description="Only this community's moderators can change its settings."
          action={
            <Link
              to={`/r/${community.slug}`}
              className="text-sm font-medium text-primary"
            >
              Back to {community.name}
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <Helmet>
        <title>Settings · {community.name} · CareCircle</title>
      </Helmet>

      <Link
        to={`/r/${community.slug}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to {community.name}
      </Link>

      <PageHeader
        icon={Settings2}
        title="Community settings"
        description={`Manage how r/${community.slug} looks and the guidance it gives members.`}
      />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          const next = new URLSearchParams(searchParams)
          next.set('tab', value)
          next.delete('page')
          setSearchParams(next, { replace: true })
        }}
      >
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="general" className="flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Members
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-1.5">
            <ListOrdered className="h-3.5 w-3.5" /> Rules
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1.5">
            <LifeBuoy className="h-3.5 w-3.5" /> Resources
          </TabsTrigger>
          <TabsTrigger value="wiki" className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Wiki
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className={cardClasses}>
          <CommunityDetailsForm community={community} />
        </TabsContent>
        <TabsContent value="members" className={cardClasses}>
          <MembersManager communityId={community.id} />
        </TabsContent>
        <TabsContent value="rules" className={cardClasses}>
          <RulesEditor communityId={community.id} />
        </TabsContent>
        <TabsContent value="resources" className={cardClasses}>
          <ResourcesEditor communityId={community.id} />
        </TabsContent>
        <TabsContent value="wiki" className={cardClasses}>
          <WikiEditor
            communityId={community.id}
            communitySlug={community.slug}
            initialPageSlug={searchParams.get('page')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
