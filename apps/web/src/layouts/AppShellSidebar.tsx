import { AppShellNavLinks } from './AppShellNavLinks'

export function AppShellSidebar() {
  return (
    <nav
      aria-label="Primary"
      className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border p-4 md:flex"
    >
      <AppShellNavLinks />
    </nav>
  )
}
