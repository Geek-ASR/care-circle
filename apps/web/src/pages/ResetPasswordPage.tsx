import { Helmet } from 'react-helmet-async'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Choose new password · CareCircle</title>
      </Helmet>
      <ResetPasswordForm />
    </>
  )
}
