import { Helmet } from 'react-helmet-async'
import { CreatePostForm } from '@/features/posts/components/CreatePostForm'

export default function SubmitPostPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Helmet>
        <title>Create post · CareCircle</title>
      </Helmet>
      <h1 className="mb-4 text-xl font-semibold text-foreground">Create a post</h1>
      <CreatePostForm />
    </div>
  )
}
