import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { AuthLayout } from '@/layouts/AuthLayout'
import { RequireAuth } from '@/components/RequireAuth'
import { RequireOnboarding } from '@/components/RequireOnboarding'

// Route-level code splitting: each page ships as its own chunk, fetched on navigation.
const RootRoute = lazy(() => import('@/pages/RootRoute'))
const CommunitiesPage = lazy(() => import('@/pages/CommunitiesPage'))
const CommunityPage = lazy(() => import('@/pages/CommunityPage'))
const PostPage = lazy(() => import('@/pages/PostPage'))
const SubmitPostPage = lazy(() => import('@/pages/SubmitPostPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export const router = createBrowserRouter(
  [
    {
      element: <RequireOnboarding />,
      children: [
        { path: '/', element: <RootRoute /> },
        {
          element: <AppShell />,
          children: [
            { path: '/communities', element: <CommunitiesPage /> },
            { path: '/r/:slug', element: <CommunityPage /> },
            { path: '/posts/:postId', element: <PostPage /> },
            { path: '/u/:username', element: <ProfilePage /> },
            {
              element: <RequireAuth />,
              children: [
                { path: '/submit', element: <SubmitPostPage /> },
                { path: '/settings', element: <SettingsPage /> },
                { path: '/notifications', element: <NotificationsPage /> },
              ],
            },
          ],
        },
        {
          element: <RequireAuth />,
          children: [{ path: '/onboarding', element: <OnboardingPage /> }],
        },
      ],
    },
    {
      element: <AuthLayout />,
      children: [
        { path: '/login', element: <LoginPage /> },
        { path: '/signup', element: <SignupPage /> },
        { path: '/forgot-password', element: <ForgotPasswordPage /> },
        { path: '/reset-password', element: <ResetPasswordPage /> },
      ],
    },
    { path: '*', element: <NotFoundPage /> },
  ],
  { basename: import.meta.env.BASE_URL },
)
