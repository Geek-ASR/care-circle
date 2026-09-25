import { AppShellNavLinks } from './AppShellNavLinks'

export function AppShellSidebar() {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-16 hidden h-[calc(100svh-4rem)] w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border/70 px-3 py-6 md:flex"
    >
      <AppShellNavLinks />
    </nav>
  )
}
