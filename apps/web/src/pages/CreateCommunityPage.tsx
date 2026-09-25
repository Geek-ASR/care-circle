import { Helmet } from 'react-helmet-async'
import { CreateCommunityForm } from '@/features/communities/components/CreateCommunityForm'
import { PageHeader } from '@/components/PageHeader'
import { UsersRound } from 'lucide-react'

export default function CreateCommunityPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <Helmet>
        <title>Create a community · CareCircle</title>
      </Helmet>
      <PageHeader
        icon={UsersRound}
        title="Create a community"
        description="Start a space for a condition or topic that isn't covered yet."
      />
      <CreateCommunityForm />
    </div>
  )
}
