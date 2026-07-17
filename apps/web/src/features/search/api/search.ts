import { supabase } from '@/services/supabaseClient'
import type { SearchResults } from '../types'

const RESULT_LIMIT = 8

/** Escapes ILIKE wildcards so a literal `%`/`_` in the query doesn't act as one. */
function ilikePattern(term: string) {
  return `%${term.replace(/[%_]/g, '\\$&')}%`
}

/** `.or()` takes a raw PostgREST filter string - strip the characters that would break its grammar. */
function forOrFilter(term: string) {
  return term.replace(/[,()]/g, ' ')
}

export async function searchAll(rawQuery: string): Promise<SearchResults> {
  const term = rawQuery.trim()
  if (term.length < 2) {
    return { posts: [], communities: [], users: [], tags: [] }
  }

  const pattern = ilikePattern(forOrFilter(term))

  const [postsRes, communitiesRes, usersRes, tagsRes] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, post_type, community:communities(slug, name)')
      .eq('status', 'published')
      .ilike('title', pattern)
      .order('score', { ascending: false })
      .limit(RESULT_LIMIT),
    supabase
      .from('communities')
      .select('id, slug, name, description, member_count, logo_url')
      .eq('is_approved', true)
      .or(`name.ilike.${pattern},slug.ilike.${pattern}`)
      .limit(RESULT_LIMIT),
    supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
      .limit(RESULT_LIMIT),
    supabase
      .from('tags')
      .select('id, name, slug')
      .ilike('name', pattern)
      .limit(RESULT_LIMIT),
  ])

  if (postsRes.error) throw postsRes.error
  if (communitiesRes.error) throw communitiesRes.error
  if (usersRes.error) throw usersRes.error
  if (tagsRes.error) throw tagsRes.error

  return {
    posts: postsRes.data as unknown as SearchResults['posts'],
    communities: communitiesRes.data as unknown as SearchResults['communities'],
    users: usersRes.data as unknown as SearchResults['users'],
    tags: tagsRes.data as unknown as SearchResults['tags'],
  }
}
