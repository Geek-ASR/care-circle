import { Helmet } from 'react-helmet-async'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { LogEntryForm } from '@/features/health-tracker/components/LogEntryForm'
import { LogEntryList } from '@/features/health-tracker/components/LogEntryList'
import { SymptomTrendChart } from '@/features/health-tracker/components/SymptomTrendChart'

export default function HealthTrackerPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Helmet>
        <title>Health tracker · CareCircle</title>
      </Helmet>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Health tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A private log only you can see. Track symptoms, medications, and mood over time.
        </p>
      </div>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New entry</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4">
          <LogEntryForm />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <LogEntryList />
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <SymptomTrendChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
