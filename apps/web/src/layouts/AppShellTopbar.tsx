import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserMenu } from '@/components/UserMenu'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { useAuth } from '@/contexts/AuthContext'

export function AppShellTopbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/communities?q=${encodeURIComponent(trimmed)}` : '/communities')
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur">
      <Link
        to="/"
        className="shrink-0 text-base font-semibold tracking-tight text-foreground"
      >
        CareCircle
      </Link>

      <form
        onSubmit={handleSearchSubmit}
        className="relative hidden max-w-md flex-1 md:block"
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search communities..."
          className="pl-9"
          aria-label="Search communities"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        {user && (
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <Link to="/submit">
              <Plus className="h-4 w-4" /> Create post
            </Link>
          </Button>
        )}
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
