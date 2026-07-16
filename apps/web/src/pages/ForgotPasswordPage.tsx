import { Helmet } from 'react-helmet-async'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Reset password · CareCircle</title>
      </Helmet>
      <ForgotPasswordForm />
    </>
  )
}
