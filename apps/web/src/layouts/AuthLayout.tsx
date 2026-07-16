import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <Link to="/" className="text-lg font-semibold tracking-tight text-foreground">
        CareCircle
      </Link>
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm">
        <Outlet />
      </div>
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        A community for people living with chronic illness to find others who understand.
      </p>
    </div>
  )
}
