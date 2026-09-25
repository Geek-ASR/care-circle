import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Compass, Home } from 'lucide-react'
import { Button } from '@/components/ui'
import { LogoMark } from '@/components/Logo'

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-[70svh] flex-col items-center justify-center gap-6 overflow-hidden px-4 text-center">
      <Helmet>
        <title>Page not found · CareCircle</title>
      </Helmet>
      <div
        aria-hidden="true"
        className="bg-dot-grid pointer-events-none absolute inset-0"
      />
      <LogoMark className="relative h-12 w-12 opacity-90" />
      <div className="relative flex flex-col gap-2">
        <p className="text-brand-gradient font-display text-7xl font-extrabold tracking-tighter">
          404
        </p>
        <h1 className="font-display text-2xl font-bold text-foreground">
          We couldn&apos;t find that page
        </h1>
        <p className="max-w-sm text-muted-foreground">
          It may have moved, been removed, or never existed. Let&apos;s get you back to
          your circle.
        </p>
      </div>
      <div className="relative flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/">
            <Home className="h-4 w-4" /> Back to home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/communities">
            <Compass className="h-4 w-4" /> Browse communities
          </Link>
        </Button>
      </div>
    </div>
  )
}
