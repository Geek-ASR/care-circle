import { Helmet } from 'react-helmet-async'
import { OnboardingForm } from '@/features/onboarding/components/OnboardingForm'

export default function OnboardingPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <Helmet>
        <title>Set up your profile · CareCircle</title>
      </Helmet>
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm">
        <OnboardingForm />
      </div>
    </div>
  )
}
