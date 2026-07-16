import { Helmet } from 'react-helmet-async'
import { SignupForm } from '@/features/auth/components/SignupForm'

export default function SignupPage() {
  return (
    <>
      <Helmet>
        <title>Create account · CareCircle</title>
      </Helmet>
      <SignupForm />
    </>
  )
}
