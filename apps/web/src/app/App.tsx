import { Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { TooltipProvider } from '@/components/ui'
import { Toaster } from '@/components/ui/Toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/LoadingScreen'
import { queryClient } from '@/services/queryClient'
import { router } from '@/routes/router'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <Suspense fallback={<LoadingScreen />}>
              <RouterProvider router={router} />
            </Suspense>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  )
}
