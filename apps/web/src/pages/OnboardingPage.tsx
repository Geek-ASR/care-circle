import { Helmet } from 'react-helmet-async'
import { Logo } from '@/components/Logo'
import { OnboardingForm } from '@/features/onboarding/components/OnboardingForm'

export default function OnboardingPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden bg-background px-4 py-12">
      <Helmet>
        <title>Set up your profile · CareCircle</title>
      </Helmet>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_50%_80%_at_50%_0%,var(--glow),transparent)]"
      />
      <Logo className="relative" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8">
        <OnboardingForm />
      </div>
    </div>
  )
}
