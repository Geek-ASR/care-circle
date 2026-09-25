-- ============================================================================
-- CareCircle: Per-community top contributors
-- ----------------------------------------------------------------------------
-- Powers the "Top contributors" card on community pages: who has been most
-- helpful in this community recently, by the score their posts and comments
-- earned. SECURITY INVOKER on purpose - it only aggregates rows the caller
-- could already read (published posts/comments, public profile fields), so
-- it can never leak anything RLS would hide.
-- ============================================================================

set search_path = public, extensions;

create or replace function public.community_top_contributors(
  cid uuid,
  p_days integer default 30,
  p_limit integer default 5
)
returns table (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  reputation_score integer,
  post_count bigint,
  comment_count bigint,
  score bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with activity as (
    select p.author_id as user_id, 1 as posts, 0 as comments, p.score
    from public.posts p
    where p.community_id = cid
      and p.status = 'published'
      and p.author_id is not null
      and p.created_at > now() - make_interval(days => greatest(p_days, 1))
    union all
    select c.author_id, 0, 1, c.score
    from public.comments c
    join public.posts p on p.id = c.post_id
    where p.community_id = cid
      and c.status = 'published'
      and c.author_id is not null
      and c.created_at > now() - make_interval(days => greatest(p_days, 1))
  )
  select
    a.user_id,
    pr.username,
    pr.display_name,
    pr.avatar_url,
    pr.reputation_score,
    sum(a.posts)::bigint as post_count,
    sum(a.comments)::bigint as comment_count,
    sum(a.score)::bigint as score
  from activity a
  join public.profiles pr on pr.id = a.user_id
  group by a.user_id, pr.username, pr.display_name, pr.avatar_url, pr.reputation_score
  order by sum(a.score) desc, sum(a.posts) + sum(a.comments) desc, pr.username
  limit least(greatest(p_limit, 1), 25);
$$;

comment on function public.community_top_contributors(uuid, integer, integer) is
  'Top contributors in a community over the last p_days days, ranked by score earned on their posts and comments.';

grant execute on function public.community_top_contributors(uuid, integer, integer) to anon, authenticated;
