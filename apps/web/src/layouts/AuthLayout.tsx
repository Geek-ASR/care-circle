import { Link, Outlet } from 'react-router-dom'
import { EyeOff, HeartHandshake, MessagesSquare, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

const HIGHLIGHTS = [
  {
    icon: HeartHandshake,
    title: 'A circle for every condition',
    text: 'Physical or mental, common or rare, lifelong or short-term.',
  },
  {
    icon: MessagesSquare,
    title: 'Real conversations',
    text: 'Questions, experiences and real-time chat with people who get it.',
  },
  {
    icon: EyeOff,
    title: 'Private by default',
    text: 'Share as much or as little as you want. You control your profile.',
  },
]

export function AuthLayout() {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-surface-sunken lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-0 h-[26rem] w-[26rem] rounded-full bg-accent/20 blur-3xl"
        />
        <div aria-hidden="true" className="bg-dot-grid absolute inset-0 opacity-60" />

        <div className="relative flex flex-1 flex-col justify-between p-12 xl:p-16">
          <Link to="/" aria-label="CareCircle home" className="w-fit">
            <Logo />
          </Link>

          <div className="flex max-w-md flex-col gap-8">
            <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground xl:text-[2.75rem]">
              You don&apos;t have to navigate it{' '}
              <span className="text-brand-gradient">alone.</span>
            </h2>
            <ul className="flex flex-col gap-5">
              {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface/80 text-primary shadow-sm backdrop-blur">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-center gap-2 text-xs text-subtle-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Peer support, not medical advice. You decide what you share.
          </p>
        </div>
      </aside>

      {/* Form column */}
      <main className="relative flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link to="/" aria-label="CareCircle home" className="lg:invisible">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
