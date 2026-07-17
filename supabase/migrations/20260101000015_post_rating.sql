-- ============================================================================
-- CareCircle: Post ratings for review-style posts
-- ----------------------------------------------------------------------------
-- posts.post_type already includes treatment_review/medication_review/
-- doctor_review/hospital_review (20260101000004_content.sql), but there was
-- no way to actually rate the thing being reviewed - without this, a
-- "review" post type is indistinguishable from a plain text post. rating is
-- nullable and unconstrained by post_type at the DB layer (same pattern as
-- posts.url, which exists on every row but is only meaningful for 'link'):
-- the application only surfaces it for the four review types.
-- ============================================================================

set search_path = public, extensions;

alter table public.posts
  add column rating smallint;

alter table public.posts
  add constraint posts_rating_range check (rating is null or rating between 1 and 5);

comment on column public.posts.rating is
  'Optional 1-5 star rating. Only meaningful for review post types (treatment_review, medication_review, doctor_review, hospital_review); null otherwise.';
