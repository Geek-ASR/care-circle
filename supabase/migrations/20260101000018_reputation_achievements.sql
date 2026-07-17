-- ============================================================================
-- CareCircle: Reputation events and achievement progress tracking
-- ----------------------------------------------------------------------------
-- reputation_events/badges/achievements/user_badges/user_achievements have
-- existed with full RLS and seed data since the reputation migration
-- (20260101000007), and profiles.reputation_score has been displayed on
-- every profile page since - but nothing has ever inserted a
-- reputation_events row or a user_achievements row. reputation_score has
-- shown 0 for every user, and the three seeded achievements have never
-- tracked a single post/comment. This migration wires both up via triggers,
-- the same pattern already used for posts.score/communities.member_count.
-- ============================================================================

set search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- award_vote_reputation(): reputation for the content AUTHOR when their
-- post/comment is voted on (not for the voter). Posts are worth more than
-- comments. Self-votes never award reputation - RLS on votes already blocks
-- voting your own content, but this stays defensive rather than assuming
-- that never changes. UPDATE only awards the *change* in value (e.g. a vote
-- flipped from -1 to +1 is a delta of +2 x multiplier), and DELETE reverses
-- the original award, so the ledger always matches the vote's current state.
-- ----------------------------------------------------------------------------
create or replace function public.award_vote_reputation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_id uuid;
  v_author_id uuid;
  v_target_type text;
  v_multiplier int;
  v_delta int;
  v_voter_id uuid;
begin
  if tg_op = 'DELETE' then
    v_target_id := coalesce(old.post_id, old.comment_id);
    v_voter_id := old.user_id;
  else
    v_target_id := coalesce(new.post_id, new.comment_id);
    v_voter_id := new.user_id;
  end if;

  if (case when tg_op = 'DELETE' then old.post_id else new.post_id end) is not null then
    v_target_type := 'post';
    v_multiplier := 5;
    select author_id into v_author_id from public.posts where id = v_target_id;
  else
    v_target_type := 'comment';
    v_multiplier := 2;
    select author_id into v_author_id from public.comments where id = v_target_id;
  end if;

  if v_author_id is not null and v_author_id != v_voter_id then
    if tg_op = 'INSERT' then
      v_delta := new.value * v_multiplier;
    elsif tg_op = 'UPDATE' then
      v_delta := (new.value - old.value) * v_multiplier;
    else
      v_delta := -old.value * v_multiplier;
    end if;

    if v_delta != 0 then
      insert into public.reputation_events (user_id, delta, reason, source_type, source_id)
      values (v_author_id, v_delta, 'vote_received', v_target_type, v_target_id);
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

comment on function public.award_vote_reputation() is
  'AFTER INSERT/UPDATE/DELETE trigger on votes: awards the target content''s author reputation_events for votes received.';

create trigger votes_award_reputation
  after insert or update or delete on public.votes
  for each row execute function public.award_vote_reputation();

-- ----------------------------------------------------------------------------
-- update_achievement_progress(): shared upsert used by the post/comment
-- triggers below. Notifies the user (as a system notification, actor_id
-- null) the first time an achievement's target is reached, respecting
-- notification_settings the same way the client-side createNotification()
-- helper does (missing key or explicit true = notify; explicit false = skip).
-- ----------------------------------------------------------------------------
create or replace function public.update_achievement_progress(
  p_user_id uuid,
  p_achievement_name text,
  p_increment int default 1
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_achievement_id uuid;
  v_target int;
  v_progress int;
  v_already_completed boolean;
  v_notify boolean;
begin
  select id, target_value into v_achievement_id, v_target
  from public.achievements where name = p_achievement_name;
  if v_achievement_id is null then
    return;
  end if;

  insert into public.user_achievements (user_id, achievement_id, progress)
  values (p_user_id, v_achievement_id, p_increment)
  on conflict (user_id, achievement_id) do update
    set progress = public.user_achievements.progress + excluded.progress
  returning progress, (completed_at is not null) into v_progress, v_already_completed;

  if v_already_completed or v_target is null or v_progress < v_target then
    return;
  end if;

  update public.user_achievements
  set completed_at = now()
  where user_id = p_user_id and achievement_id = v_achievement_id;

  select coalesce((notification_settings ->> 'badge_earned')::boolean, true)
  into v_notify
  from public.profiles where id = p_user_id;

  if v_notify then
    insert into public.notifications (user_id, actor_id, type, target_type, target_id)
    values (p_user_id, null, 'badge_earned', 'achievement', v_achievement_id);
  end if;
end;
$$;

create or replace function public.track_post_achievement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and new.author_id is not null then
    perform public.update_achievement_progress(new.author_id, 'First Post', 1);
  end if;
  return new;
end;
$$;

create trigger posts_track_achievement
  after insert on public.posts
  for each row execute function public.track_post_achievement();

create or replace function public.track_comment_achievement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and new.author_id is not null then
    perform public.update_achievement_progress(new.author_id, 'Getting Involved', 1);
    perform public.update_achievement_progress(new.author_id, 'Pillar of Support', 1);
  end if;
  return new;
end;
$$;

create trigger comments_track_achievement
  after insert on public.comments
  for each row execute function public.track_comment_achievement();
