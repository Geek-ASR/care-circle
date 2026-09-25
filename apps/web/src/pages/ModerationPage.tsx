import { Helmet } from 'react-helmet-async'
import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useIsModerator } from '@/features/moderation/hooks/useModeration'
import { AdminOverview } from '@/features/moderation/components/AdminOverview'
import { ReportQueue } from '@/features/moderation/components/ReportQueue'
import { PendingCommunitiesQueue } from '@/features/moderation/components/PendingCommunitiesQueue'
import { AdminResourcesPanel } from '@/features/resources/components/AdminResourcesPanel'
import { PageHeader } from '@/components/PageHeader'
import { Shield } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { AuditLogPanel } from '@/features/governance/components/AuditLogPanel'
import { SiteRolesPanel } from '@/features/governance/components/SiteRolesPanel'

const cardClasses =
  'mt-4 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6'

export default function ModerationPage() {
  const { isModerator, isAdmin, isLoading } = useIsModerator()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <Helmet>
        <title>Moderation · CareCircle</title>
      </Helmet>
      <PageHeader
        icon={Shield}
        title="Moderation"
        description="Review reports, pending communities and keep every space safe."
      />

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20" />
        </div>
      )}

      {!isLoading && !isModerator && (
        <EmptyState
          icon={Shield}
          title="You don't moderate any communities yet"
          description="Community moderators and site staff can review reports and manage content here."
        />
      )}

      {!isLoading && isModerator && !isAdmin && <ReportQueue />}

      {!isLoading && isAdmin && (
        <Tabs defaultValue="overview">
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="communities">Pending communities</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="roles">Site roles</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
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
          <TabsContent value="roles" className={cardClasses}>
            <SiteRolesPanel />
          </TabsContent>
          <TabsContent value="audit" className={cardClasses}>
            <AuditLogPanel />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
