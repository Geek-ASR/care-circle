import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserMenu } from '@/components/UserMenu'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { MessagesLink } from '@/features/chat/components/MessagesLink'
import { useAuth } from '@/contexts/AuthContext'
import { MobileNav } from './MobileNav'

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  )
}

export function AppShellTopbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // "/" or Cmd/Ctrl+K jumps to search from anywhere, like most modern web apps.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isShortcut =
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && !isTypingTarget(e.target))
      if (!isShortcut || !searchRef.current) return
      if (searchRef.current.offsetParent === null) return // hidden on mobile
      e.preventDefault()
      searchRef.current.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-2 px-3 md:gap-4 md:px-0 md:pr-6">
        <MobileNav />

        <Link
          to="/"
          className="shrink-0 rounded-lg md:w-64 md:px-6"
          aria-label="CareCircle home"
        >
          <Logo />
        </Link>

        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden max-w-xl flex-1 md:block lg:ml-4"
        >
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden="true"
          />
          <Input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, communities, people…"
            className="h-10 rounded-full bg-surface-sunken pl-10 pr-14 shadow-none"
            aria-label="Search"
          />
          <kbd
            className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-surface px-1.5 py-0.5 font-sans text-[10px] font-medium text-subtle-foreground lg:inline-flex"
            aria-hidden="true"
          >
            ⌘K
          </kbd>
        </form>

        <div className="ml-auto flex items-center gap-1 md:gap-1.5">
          {user && (
            <Button asChild size="sm" className="hidden h-9 px-3.5 sm:inline-flex">
              <Link to="/submit">
                <Plus className="h-4 w-4" /> Create post
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link to="/search" aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </Link>
          </Button>
          <ThemeToggle />
          <MessagesLink />
          <NotificationBell />
          <div className="ml-1">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
