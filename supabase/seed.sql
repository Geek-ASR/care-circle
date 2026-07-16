-- ============================================================================
-- CareCircle: local dev seed data
-- ----------------------------------------------------------------------------
-- Populates reference/taxonomy data that has no dependency on real
-- auth.users accounts: conditions, one official community per condition,
-- tags, badges, and the baseline RBAC rows (roles/permissions/
-- role_permissions).
--
-- Deliberately NOT included: fake rows in auth.users or profiles. Supabase
-- Auth owns auth.users; you cannot fabricate a valid account by inserting
-- into it directly (no password/identity records, and profiles.id has an
-- ON DELETE CASCADE FK to auth.users). To get user-owned sample content
-- (posts, comments, votes, memberships, etc.):
--   1. Sign up a few real test accounts locally (via the app, or
--      `supabase auth admin` / the Studio Auth UI, or Inbucket for the
--      confirmation email at http://127.0.0.1:54324).
--   2. Note the generated auth.users.id (= profiles.id) for each.
--   3. Adapt the commented-out example block at the bottom of this file.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Conditions
-- ----------------------------------------------------------------------------
insert into public.conditions (name, slug, description, category)
values
  ('Ankylosing Spondylitis', 'ankylosing-spondylitis', 'A form of inflammatory arthritis that primarily affects the spine and sacroiliac joints.', 'autoimmune'),
  ('Rheumatoid Arthritis', 'rheumatoid-arthritis', 'An autoimmune condition causing joint inflammation, pain, and progressive damage.', 'autoimmune'),
  ('Lupus', 'lupus', 'A chronic autoimmune disease in which the immune system attacks healthy tissue across multiple organ systems.', 'autoimmune'),
  ('Fibromyalgia', 'fibromyalgia', 'A chronic condition characterized by widespread musculoskeletal pain, fatigue, and tenderness.', 'chronic_pain'),
  ('Psoriasis', 'psoriasis', 'An autoimmune skin condition causing rapid skin cell buildup, resulting in scaling and inflammation.', 'autoimmune'),
  ('Crohn''s Disease', 'crohns-disease', 'A type of inflammatory bowel disease causing inflammation of the digestive tract.', 'digestive'),
  ('Cancer', 'cancer', 'A broad group of diseases involving abnormal cell growth, spanning many types and treatment journeys.', 'oncology'),
  ('Diabetes', 'diabetes', 'A group of metabolic diseases characterized by high blood sugar levels over a prolonged period.', 'endocrine'),
  ('Multiple Sclerosis', 'multiple-sclerosis', 'A disease in which the immune system attacks the protective sheath covering nerve fibers.', 'neurological'),
  ('Ulcerative Colitis', 'ulcerative-colitis', 'A type of inflammatory bowel disease causing long-lasting inflammation of the colon and rectum.', 'digestive'),
  ('Endometriosis', 'endometriosis', 'A condition where tissue similar to the uterine lining grows outside the uterus, often causing chronic pain.', 'reproductive_health'),
  ('Long COVID', 'long-covid', 'A range of ongoing symptoms that persist for weeks or months after a COVID-19 infection.', 'post_viral'),
  ('Mental Health — Depression & Anxiety', 'depression-anxiety', 'A space for chronic and situational depression and anxiety, including comorbidity with physical illness.', 'mental_health'),
  ('POTS', 'pots', 'Postural Orthostatic Tachycardia Syndrome, a form of dysautonomia affecting blood flow regulation.', 'dysautonomia'),
  ('Chronic Fatigue Syndrome', 'chronic-fatigue-syndrome', 'Also known as ME/CFS - a complex disorder characterized by extreme fatigue not improved by rest.', 'neuroimmune'),
  ('Migraine', 'migraine', 'A neurological condition involving recurrent, often debilitating headache attacks.', 'neurological'),
  ('Rare Disease — General', 'rare-disease-general', 'A general-purpose community for people navigating rare and undiagnosed conditions.', 'rare_disease')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Communities: one official, pre-approved community per condition.
-- created_by is left NULL (no real user owns these seed communities).
-- ----------------------------------------------------------------------------
insert into public.communities (slug, name, description, condition_id, is_approved, created_by)
select
  c.slug,
  c.name,
  'A supportive space to share experiences, ask questions, and find encouragement around ' || c.name || '.',
  c.id,
  true,
  null
from public.conditions c
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Tags
-- ----------------------------------------------------------------------------
insert into public.tags (name, slug)
values
  ('Pain', 'pain'),
  ('Medication', 'medication'),
  ('Exercise', 'exercise'),
  ('MRI', 'mri'),
  ('Diagnosis', 'diagnosis'),
  ('Mental Health', 'mental-health'),
  ('Biologics', 'biologics'),
  ('Diet', 'diet'),
  ('Yoga', 'yoga'),
  ('Support', 'support'),
  ('Recovery', 'recovery')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Badges
-- ----------------------------------------------------------------------------
insert into public.badges (name, description, icon, criteria)
values
  ('Early Supporter', 'Joined CareCircle during its early days and helped shape the community.', 'sparkles', 'Account created before the platform''s public launch.'),
  ('Top Helper', 'Recognized for consistently helpful, high-quality replies to others seeking support.', 'life-buoy', 'Reached a high number of upvoted comments marked helpful by recipients.'),
  ('Community Leader', 'Awarded to trusted moderators who go above and beyond for their community.', 'shield', 'Moderates a community in good standing for an extended period.'),
  ('Top Contributor', 'Awarded for sustained, high-quality posting activity across the platform.', 'star', 'Reached a high cumulative reputation score from posts and comments.')
on conflict (name) do nothing;

-- ----------------------------------------------------------------------------
-- Achievements (progress-tracked)
-- ----------------------------------------------------------------------------
insert into public.achievements (name, description, icon, target_value)
values
  ('First Post', 'Share your first post with the community.', 'pencil', 1),
  ('Getting Involved', 'Leave 10 comments supporting others.', 'message-circle', 10),
  ('Pillar of Support', 'Leave 100 comments supporting others.', 'heart-handshake', 100)
on conflict (name) do nothing;

-- ----------------------------------------------------------------------------
-- Roles & permissions (site-wide RBAC)
-- ----------------------------------------------------------------------------
insert into public.roles (name, description)
values
  ('admin', 'Site-wide administrator with full platform access.'),
  ('moderator', 'Site-wide trust & safety moderator (distinct from per-community moderators in community_members).'),
  ('member', 'Standard platform member.')
on conflict (name) do nothing;

insert into public.permissions (name, description)
values
  ('manage_users', 'Create, edit, suspend, or delete user accounts.'),
  ('manage_communities', 'Approve, edit, or remove communities.'),
  ('manage_roles', 'Grant or revoke site-wide roles.'),
  ('ban_users', 'Ban or suspend users platform-wide.'),
  ('feature_posts', 'Pin or feature posts across the platform.'),
  ('manage_reports', 'Review and action user-submitted trust & safety reports.')
on conflict (name) do nothing;

-- Admins get every permission.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
on conflict do nothing;

-- Site-wide moderators get a trust & safety-focused subset.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.name in ('ban_users', 'feature_posts', 'manage_reports')
where r.name = 'moderator'
on conflict do nothing;

-- ============================================================================
-- User-owned sample data (posts, comments, memberships, votes, etc.)
-- ----------------------------------------------------------------------------
-- Uncomment and fill in real profile ids AFTER creating test accounts
-- locally (see the note at the top of this file). Example shape below.
-- ============================================================================

-- do $$
-- declare
--   demo_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- replace with a real auth.users/profiles id
--   demo_community_id uuid;
--   demo_post_id uuid;
-- begin
--   select id into demo_community_id from public.communities where slug = 'rheumatoid-arthritis';
--
--   insert into public.community_members (community_id, user_id, role)
--   values (demo_community_id, demo_user_id, 'member')
--   on conflict do nothing;
--
--   insert into public.posts (community_id, author_id, post_type, title, body)
--   values (
--     demo_community_id,
--     demo_user_id,
--     'experience',
--     'Finally finding a biologic that works for me',
--     'After three years of trial and error, my rheumatologist and I found a treatment plan that''s actually helping. Sharing in case it helps someone else.'
--   )
--   returning id into demo_post_id;
--
--   insert into public.votes (user_id, post_id, value)
--   values (demo_user_id, demo_post_id, 1)
--   on conflict do nothing;
-- end $$;
