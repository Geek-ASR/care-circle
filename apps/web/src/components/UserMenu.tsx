import { Link, useNavigate } from 'react-router-dom'
import { Bookmark, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { avatarGradient } from '@/utils/avatarColor'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'

export function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <Button asChild size="sm">
        <Link to="/login">Sign in</Link>
      </Button>
    )
  }

  const initials = (profile?.display_name ?? profile?.username ?? user.email ?? '?')
    .charAt(0)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full ring-2 ring-transparent transition-shadow hover:ring-border-strong focus-visible:outline-none focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback
              className={`${avatarGradient(profile?.username ?? user.id)} font-semibold text-white`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2.5 py-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {profile?.display_name ?? profile?.username ?? 'Your account'}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {profile ? `@${profile.username}` : user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={profile ? `/u/${profile.username}` : '#'}>
            <UserIcon className="h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/saved">
            <Bookmark className="h-4 w-4" /> Saved posts
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-danger focus:bg-danger/10"
          onSelect={() => {
            void signOut().then(() => navigate('/'))
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
