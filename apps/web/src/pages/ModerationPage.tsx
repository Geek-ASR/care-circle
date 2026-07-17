import { Helmet } from 'react-helmet-async'
import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useIsModerator } from '@/features/moderation/hooks/useModeration'
import { AdminOverview } from '@/features/moderation/components/AdminOverview'
import { ReportQueue } from '@/features/moderation/components/ReportQueue'
import { PendingCommunitiesQueue } from '@/features/moderation/components/PendingCommunitiesQueue'
import { AdminResourcesPanel } from '@/features/resources/components/AdminResourcesPanel'

export default function ModerationPage() {
  const { isModerator, isAdmin, isLoading } = useIsModerator()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Helmet>
        <title>Moderation · CareCircle</title>
      </Helmet>
      <h1 className="text-xl font-semibold text-foreground">Moderation</h1>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20" />
        </div>
      )}

      {!isLoading && !isModerator && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          You don&apos;t moderate any communities yet.
        </p>
      )}

      {!isLoading && isModerator && !isAdmin && <ReportQueue />}

      {!isLoading && isAdmin && (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="communities">Pending communities</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <AdminOverview />
          </TabsContent>
          <TabsContent value="reports" className="mt-4">
            <ReportQueue />
          </TabsContent>
          <TabsContent value="communities" className="mt-4">
            <PendingCommunitiesQueue />
          </TabsContent>
          <TabsContent value="resources" className="mt-4">
            <AdminResourcesPanel />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
