import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'
import { queryKeys } from '@/services/queryClient'
import type { Profile } from '@/types/database'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  isAuthLoading: boolean
  isProfileLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        queryClient.removeQueries({ queryKey: ['profile'] })
      }
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  const userId = session?.user.id

  const profileQuery = useQuery({
    queryKey: userId ? queryKeys.profile(userId) : ['profile', 'signed-out'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as string)
        .single()
      if (error) throw error
      return data as Profile
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  })

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile: profileQuery.data ?? null,
      isAuthLoading,
      isProfileLoading: Boolean(userId) && profileQuery.isLoading,
      signOut,
    }),
    [session, profileQuery.data, profileQuery.isLoading, isAuthLoading, userId, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- context + hook are intentionally co-located
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
