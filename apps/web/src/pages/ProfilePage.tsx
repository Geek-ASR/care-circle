import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CalendarDays, Globe, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage, Badge, Skeleton } from '@/components/ui'
import { useProfileByUsername } from '@/features/profile/hooks/useProfile'
import NotFoundPage from './NotFoundPage'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { data: profile, isLoading } = useProfileByUsername(username)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (!profile) return <NotFoundPage />

  const initials = (profile.display_name ?? profile.username).charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-2xl">
      <Helmet>
        <title>{profile.display_name ?? profile.username} · CareCircle</title>
      </Helmet>

      {profile.banner_url && (
        <div className="h-32 w-full overflow-hidden rounded-lg bg-surface-hover">
          <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div
        className={
          profile.banner_url ? '-mt-8 flex items-end gap-4 px-2' : 'flex items-end gap-4'
        }
      >
        <Avatar className="h-16 w-16 border-4 border-background">
          <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {profile.display_name ?? profile.username}
          </h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
      </div>

      {profile.bio && <p className="mt-4 text-sm text-foreground">{profile.bio}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {profile.country && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {profile.country}
          </span>
        )}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />{' '}
            {profile.website.replace(/^https?:\/\//, '')}
          </a>
        )}
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" /> Joined{' '}
          {format(new Date(profile.created_at), 'MMMM yyyy')}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="primary">{profile.reputation_score} reputation</Badge>
        {profile.verified_diagnosis && (
          <Badge variant="success">Verified diagnosis</Badge>
        )}
      </div>
    </div>
  )
}
