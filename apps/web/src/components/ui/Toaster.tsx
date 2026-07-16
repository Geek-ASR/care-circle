import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useToastStore } from '@/store/toastStore'

const variantClasses: Record<
  NonNullable<import('@/store/toastStore').ToastItem['variant']>,
  string
> = {
  default: 'border-border bg-surface-raised',
  success: 'border-success/40 bg-surface-raised',
  danger: 'border-danger/40 bg-surface-raised',
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          onOpenChange={(open) => {
            if (!open) dismiss(t.id)
          }}
          className={cn(
            'grid grid-cols-[1fr_auto] items-center gap-x-3 rounded-md border p-4 shadow-lg',
            'data-[state=open]:animate-none data-[state=open]:opacity-100',
            'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
            variantClasses[t.variant ?? 'default'],
          )}
        >
          <div>
            <ToastPrimitive.Title className="text-sm font-semibold text-foreground">
              {t.title}
            </ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                {t.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close
            className="row-span-2 rounded-sm text-muted-foreground opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
    </ToastPrimitive.Provider>
  )
}
