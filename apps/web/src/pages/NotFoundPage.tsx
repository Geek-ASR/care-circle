import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <Helmet>
        <title>Page not found · CareCircle</title>
      </Helmet>
      <h1 className="text-4xl font-semibold text-foreground">404</h1>
      <p className="text-muted-foreground">
        This page doesn&apos;t exist, or may have moved.
      </p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  )
}
