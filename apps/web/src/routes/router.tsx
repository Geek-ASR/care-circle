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
const WikiPagePage = lazy(() => import('@/pages/WikiPagePage'))
const PostPage = lazy(() => import('@/pages/PostPage'))
const SubmitPostPage = lazy(() => import('@/pages/SubmitPostPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const SavedPostsPage = lazy(() => import('@/pages/SavedPostsPage'))
const MessagesPage = lazy(() => import('@/pages/MessagesPage'))
const ConversationPage = lazy(() => import('@/pages/ConversationPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const FollowersPage = lazy(() => import('@/pages/FollowersPage'))
const FollowingPage = lazy(() => import('@/pages/FollowingPage'))
const CreateCommunityPage = lazy(() => import('@/pages/CreateCommunityPage'))
const ModerationPage = lazy(() => import('@/pages/ModerationPage'))
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'))
const HealthTrackerPage = lazy(() => import('@/pages/HealthTrackerPage'))
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
            { path: '/search', element: <SearchPage /> },
            { path: '/resources', element: <ResourcesPage /> },
            { path: '/r/:slug', element: <CommunityPage /> },
            { path: '/r/:slug/wiki/:wikiSlug', element: <WikiPagePage /> },
            { path: '/posts/:postId', element: <PostPage /> },
            { path: '/u/:username', element: <ProfilePage /> },
            { path: '/u/:username/followers', element: <FollowersPage /> },
            { path: '/u/:username/following', element: <FollowingPage /> },
            {
              element: <RequireAuth />,
              children: [
                { path: '/submit', element: <SubmitPostPage /> },
                { path: '/settings', element: <SettingsPage /> },
                { path: '/notifications', element: <NotificationsPage /> },
                { path: '/saved', element: <SavedPostsPage /> },
                { path: '/messages', element: <MessagesPage /> },
                { path: '/messages/:conversationId', element: <ConversationPage /> },
                { path: '/communities/new', element: <CreateCommunityPage /> },
                { path: '/moderation', element: <ModerationPage /> },
                { path: '/tracker', element: <HealthTrackerPage /> },
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
