import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui'
import { AppShellNavLinks } from './AppShellNavLinks'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50 transition-opacity duration-150',
            'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col gap-6',
            'border-r border-border bg-surface-raised p-4 shadow-lg',
            'transition-transform duration-200 ease-out focus:outline-none',
            'data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title asChild>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="text-base font-semibold text-foreground"
              >
                CareCircle
              </Link>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <AppShellNavLinks onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
