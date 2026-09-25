import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { AppShellSidebar } from './AppShellSidebar'
import { AppShellTopbar } from './AppShellTopbar'

interface AppShellProps {
  // Normally used as a react-router layout route (renders <Outlet/>). RootRoute also
  // composes it directly with explicit children for the signed-in "/" feed, since that
  // path needs to pick between this shell and the anonymous landing page at the same URL.
  children?: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-72 bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,var(--glow),transparent)]"
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <AppShellTopbar />
      <div className="relative mx-auto flex w-full max-w-[1400px] flex-1">
        <AppShellSidebar />
        <main
          className="min-w-0 flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8"
          id="main-content"
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}
