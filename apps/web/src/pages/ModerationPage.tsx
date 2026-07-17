import { Helmet } from 'react-helmet-async'
import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useIsModerator } from '@/features/moderation/hooks/useModeration'
import { ReportQueue } from '@/features/moderation/components/ReportQueue'
import { PendingCommunitiesQueue } from '@/features/moderation/components/PendingCommunitiesQueue'

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
        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="communities">Pending communities</TabsTrigger>
          </TabsList>
          <TabsContent value="reports" className="mt-4">
            <ReportQueue />
          </TabsContent>
          <TabsContent value="communities" className="mt-4">
            <PendingCommunitiesQueue />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
