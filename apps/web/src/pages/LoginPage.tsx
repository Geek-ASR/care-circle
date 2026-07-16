import { Helmet } from 'react-helmet-async'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Sign in · CareCircle</title>
      </Helmet>
      <LoginForm />
    </>
  )
}
