import { Helmet } from 'react-helmet-async'
import { CreateCommunityForm } from '@/features/communities/components/CreateCommunityForm'

export default function CreateCommunityPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <Helmet>
        <title>Create a community · CareCircle</title>
      </Helmet>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Create a community</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start a space for a condition or topic that isn&apos;t covered yet.
        </p>
      </div>
      <CreateCommunityForm />
    </div>
  )
}
