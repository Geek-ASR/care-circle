import { Helmet } from 'react-helmet-async'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { LogEntryForm } from '@/features/health-tracker/components/LogEntryForm'
import { LogEntryList } from '@/features/health-tracker/components/LogEntryList'
import { SymptomTrendChart } from '@/features/health-tracker/components/SymptomTrendChart'
import { PageHeader } from '@/components/PageHeader'
import { Stethoscope } from 'lucide-react'

export default function HealthTrackerPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Helmet>
        <title>Health tracker · CareCircle</title>
      </Helmet>
      <PageHeader
        icon={Stethoscope}
        title="Health tracker"
        description="A private log only you can see. Track symptoms, medications, and mood over time."
      />

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New entry</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent
          value="new"
          className="mt-5 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7"
        >
          <LogEntryForm />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <LogEntryList />
        </TabsContent>

        <TabsContent
          value="trends"
          className="mt-5 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7"
        >
          <SymptomTrendChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
