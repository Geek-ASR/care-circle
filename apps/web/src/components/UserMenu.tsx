import { Link, useNavigate } from 'react-router-dom'
import { Bookmark, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <Avatar>
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
