import { LogoMark } from './Logo'

export function LoadingScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background">
      <div className="relative">
        <span
          className="absolute inset-0 animate-ping rounded-xl bg-primary/25"
          aria-hidden="true"
        />
        <LogoMark className="relative h-11 w-11" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
