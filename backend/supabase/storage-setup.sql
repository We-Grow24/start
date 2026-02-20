-- ═══════════════════════════════════════════════════════════════
-- SVARNEX — Supabase Storage Bucket Setup
-- Run via: psql -h localhost -U postgres -d postgres -f supabase/storage-setup.sql
-- Or paste into Supabase SQL Editor (Dashboard)
--
-- Creates all required storage buckets for Svarnex platform.
-- Idempotent: safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════


-- ── Bucket 1: exports ────────────────────────────────────────
-- Stores exported ZIP / APK / IPA / WASM bundles from materialisation
-- Accessed via signed URLs (private bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports',
  'exports',
  false,
  104857600,  -- 100 MB
  ARRAY['application/zip', 'application/vnd.android.package-archive', 'application/octet-stream', 'application/wasm']
)
ON CONFLICT (id) DO NOTHING;


-- ── Bucket 2: invoices ───────────────────────────────────────
-- Stores generated invoice PDFs
-- Private bucket — users access via signed URLs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,
  5242880,  -- 5 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;


-- ── Bucket 3: assets ─────────────────────────────────────────
-- Stores Infinite Library assets (SDF, GLTF, WGSL shaders, audio)
-- Public bucket — assets served via CDN
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,
  52428800,  -- 50 MB
  ARRAY[
    'model/gltf-binary', 'model/gltf+json',
    'application/json',
    'audio/mpeg', 'audio/wav',
    'application/octet-stream',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;


-- ── Bucket 4: avatars ────────────────────────────────────────
-- User profile avatars
-- Public bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;


-- ── Bucket 5: project-thumbnails ─────────────────────────────
-- Ghost Snapshot thumbnails for Chronos Timeline
-- Public bucket — served in Nexus carousel and timeline
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-thumbnails',
  'project-thumbnails',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- STORAGE POLICIES (RLS)
-- ═══════════════════════════════════════════════════════════════


-- ── exports: owner can read, service role can write ──────────
CREATE POLICY "exports: owner read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "exports: service write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'exports'
    AND auth.role() = 'service_role'
  );


-- ── invoices: owner can read, service role can write ─────────
CREATE POLICY "invoices: owner read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoices'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "invoices: service write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'invoices'
    AND auth.role() = 'service_role'
  );


-- ── assets: public read, service role can write ──────────────
CREATE POLICY "assets: public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets');

CREATE POLICY "assets: service write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets'
    AND auth.role() = 'service_role'
  );


-- ── avatars: owner can CRUD own folder, public read ──────────
CREATE POLICY "avatars: public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars: owner upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars: owner update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars: owner delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );


-- ── project-thumbnails: public read, owner can upload ────────
CREATE POLICY "thumbnails: public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-thumbnails');

CREATE POLICY "thumbnails: owner upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "thumbnails: service write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-thumbnails'
    AND auth.role() = 'service_role'
  );


-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION
-- Run: SELECT id, name, public FROM storage.buckets ORDER BY name;
-- Expected: assets (public), avatars (public), exports (private),
--   invoices (private), project-thumbnails (public)
-- ═══════════════════════════════════════════════════════════════
