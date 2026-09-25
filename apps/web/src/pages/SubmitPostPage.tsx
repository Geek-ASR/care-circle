import { Helmet } from 'react-helmet-async'
import { CreatePostForm } from '@/features/posts/components/CreatePostForm'
import { PageHeader } from '@/components/PageHeader'
import { PenSquare } from 'lucide-react'

export default function SubmitPostPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Helmet>
        <title>Create post · CareCircle</title>
      </Helmet>
      <PageHeader
        icon={PenSquare}
        title="Create a post"
        description="Ask a question, share an experience, run a poll or review a treatment."
        className="mb-6"
      />
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-7">
        <CreatePostForm />
      </div>
    </div>
  )
}
