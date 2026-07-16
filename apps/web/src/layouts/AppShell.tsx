import { Outlet } from 'react-router-dom'
import { AppShellSidebar } from './AppShellSidebar'
import { AppShellTopbar } from './AppShellTopbar'

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <AppShellTopbar />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <AppShellSidebar />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
