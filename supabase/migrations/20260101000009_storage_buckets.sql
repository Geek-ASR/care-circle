-- ============================================================================
-- CareCircle: Storage buckets & policies
-- ----------------------------------------------------------------------------
-- Buckets: avatars, banners, post-media (all public-read, owner-scoped
-- write via an auth.uid()-prefixed path convention "{user_id}/{filename}"),
-- and message-attachments (private, access scoped to conversation
-- participants via the path convention "{conversation_id}/{filename}").
--
-- Note on size/type limits: Postgres RLS policies evaluate against
-- storage.objects rows and cannot inspect the raw bytes of an in-flight
-- upload, so they cannot enforce an actual byte-size limit. The
-- authoritative limits are the bucket-level file_size_limit/
-- allowed_mime_types set below, which are enforced by the Storage API
-- itself before the object row is ever written. As defense-in-depth, the
-- INSERT/UPDATE policies below additionally reject obviously-wrong file
-- extensions via a regex on the object name/path.
-- ============================================================================

set search_path = public, extensions;

-- storage.objects ships with RLS already enabled on hosted/local Supabase;
-- this is defensive/idempotent so the migration is correct standalone.
alter table storage.objects enable row level security;

-- ----------------------------------------------------------------------------
-- Buckets
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('banners', 'banners', true, 8388608, array['image/png', 'image/jpeg', 'image/webp']),
  ('post-media', 'post-media', true, 26214400, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']),
  ('message-attachments', 'message-attachments', false, 26214400, null)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- avatars: public read; write restricted to a path prefixed with the
-- uploader's own uid, i.e. "{auth.uid()}/{filename}".
-- ----------------------------------------------------------------------------
create policy "avatars_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "avatars_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and name ~* '\.(png|jpe?g|webp|gif)$'
  );

create policy "avatars_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ----------------------------------------------------------------------------
-- banners: same owner-prefixed pattern as avatars.
-- ----------------------------------------------------------------------------
create policy "banners_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'banners');

create policy "banners_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'banners'
    and (storage.foldername(name))[1] = auth.uid()::text
    and name ~* '\.(png|jpe?g|webp)$'
  );

create policy "banners_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "banners_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);

-- ----------------------------------------------------------------------------
-- post-media: public read; write restricted to a path prefixed with the
-- uploader's own uid, i.e. "{auth.uid()}/{filename}". Post ownership itself
-- (which post a media row belongs to) is enforced at the post_media table
-- level, not here.
-- ----------------------------------------------------------------------------
create policy "post_media_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'post-media');

create policy "post_media_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and name ~* '\.(png|jpe?g|webp|gif|mp4|webm)$'
  );

create policy "post_media_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "post_media_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ----------------------------------------------------------------------------
-- message-attachments: private. Path convention is
-- "{conversation_id}/{filename}". Read/write restricted to participants of
-- that conversation (checked via conversation_participants). No
-- update/delete policy is defined, so those default-deny for all clients -
-- message history is treated as immutable once sent, matching messages
-- having no client-facing delete/update path either.
-- ----------------------------------------------------------------------------
create policy "message_attachments_participant_read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'message-attachments'
    and exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = ((storage.foldername(name))[1])::uuid
        and cp.user_id = auth.uid()
    )
  );

create policy "message_attachments_participant_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'message-attachments'
    and exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = ((storage.foldername(name))[1])::uuid
        and cp.user_id = auth.uid()
    )
  );
