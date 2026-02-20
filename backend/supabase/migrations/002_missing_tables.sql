-- ═══════════════════════════════════════════════════════════════
-- SVARNEX — Migration 002: Missing Tables
-- Run AFTER 001_initial_schema.sql
-- Creates 8 tables that are NOT in 001.
-- All use CREATE TABLE IF NOT EXISTS for idempotency.
-- ═══════════════════════════════════════════════════════════════


-- ── TABLE 1/8: referrals ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id           UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  referred_id           UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  referral_code         TEXT NOT NULL UNIQUE,
  status                TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','CONVERTED','REWARDED')),
  chips_awarded         INTEGER DEFAULT 0,
  referee_chips_awarded INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  converted_at          TIMESTAMPTZ
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'referrer_sees_own'
  ) THEN
    CREATE POLICY "referrer_sees_own" ON public.referrals
      FOR SELECT USING (referrer_id = auth.uid());
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'referrals: service role all'
  ) THEN
    CREATE POLICY "referrals: service role all" ON public.referrals
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ── TABLE 2/8: invoices ──────────────────────────────────────
-- NOTE: invoice_number gets a proper sequence in 003.
CREATE TABLE IF NOT EXISTS public.invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  amount_paise      INTEGER NOT NULL,
  gst_amount_paise  INTEGER DEFAULT 0,
  gstin_user        TEXT,
  invoice_number    TEXT UNIQUE DEFAULT 'PENDING-' || gen_random_uuid()::TEXT,
  invoice_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  pdf_url           TEXT,
  status            TEXT NOT NULL DEFAULT 'ISSUED'
                    CHECK (status IN ('ISSUED','PAID','VOID')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'user_sees_own_invoices'
  ) THEN
    CREATE POLICY "user_sees_own_invoices" ON public.invoices
      FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'invoices: service role all'
  ) THEN
    CREATE POLICY "invoices: service role all" ON public.invoices
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ── TABLE 3/8: infinite_library_assets ───────────────────────
CREATE TABLE IF NOT EXISTS public.infinite_library_assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id         UUID REFERENCES public.infinite_library_blocks(block_id) ON DELETE SET NULL,
  asset_type       TEXT NOT NULL
                   CHECK (asset_type IN ('CHARACTER','ENVIRONMENT','WEAPON','VFX','UI','AUDIO','PARTICLE')),
  zone_type        TEXT NOT NULL DEFAULT 'ENGINE',
  species_name     TEXT NOT NULL,
  niche            TEXT,
  sub_niche        TEXT,
  file_path        TEXT NOT NULL,
  file_format      TEXT NOT NULL
                   CHECK (file_format IN ('SDF','GLTF','WGSL','MP3','WAV','JSON')),
  sdf_params       JSONB,
  wgsl_shader_path TEXT,
  block_version    TEXT NOT NULL DEFAULT 'v1.0',
  is_premium       BOOLEAN DEFAULT false,
  tier_required    TEXT DEFAULT 'SCALE'
                   CHECK (tier_required IN ('PRESENCE','BUSINESS','SCALE')),
  vibe_embedding   vector(1536),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.infinite_library_assets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'infinite_library_assets' AND policyname = 'authenticated_can_read_assets'
  ) THEN
    CREATE POLICY "authenticated_can_read_assets" ON public.infinite_library_assets
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'infinite_library_assets' AND policyname = 'assets: service role all'
  ) THEN
    CREATE POLICY "assets: service role all" ON public.infinite_library_assets
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ── TABLE 4/8: game_saves ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.game_saves (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  player_id    TEXT NOT NULL,
  save_data    JSONB NOT NULL DEFAULT '{}',
  score        INTEGER DEFAULT 0,
  level        INTEGER DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'game_saves' AND policyname = 'game_owner_reads_saves'
  ) THEN
    CREATE POLICY "game_owner_reads_saves" ON public.game_saves
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = game_id AND user_id = auth.uid())
      );
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'game_saves' AND policyname = 'game_saves: service role all'
  ) THEN
    CREATE POLICY "game_saves: service role all" ON public.game_saves
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ── TABLE 5/8: questionnaire_niche_map ───────────────────────
CREATE TABLE IF NOT EXISTS public.questionnaire_niche_map (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche          TEXT NOT NULL,
  sub_niche      TEXT,
  zone_type      TEXT NOT NULL,
  block_types    TEXT[] NOT NULL DEFAULT '{}',
  q1_default     TEXT,
  vibe_default   TEXT,
  priority_order INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(niche, sub_niche, zone_type)
);
ALTER TABLE public.questionnaire_niche_map ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'questionnaire_niche_map' AND policyname = 'public_read_niche_map'
  ) THEN
    CREATE POLICY "public_read_niche_map" ON public.questionnaire_niche_map
      FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'questionnaire_niche_map' AND policyname = 'niche_map: service role all'
  ) THEN
    CREATE POLICY "niche_map: service role all" ON public.questionnaire_niche_map
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ── TABLE 6/8: seo_snapshots ─────────────────────────────────
-- Different from seo_scores (which already exists in 001).
-- Stores SEO audit snapshots with lighthouse / meta / OG data.
CREATE TABLE IF NOT EXISTS public.seo_snapshots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  lighthouse_score INTEGER,
  meta_score       INTEGER,
  sitemap_valid    BOOLEAN DEFAULT false,
  alt_coverage     FLOAT,
  og_complete      BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.seo_snapshots ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'seo_snapshots' AND policyname = 'owner_sees_seo'
  ) THEN
    CREATE POLICY "owner_sees_seo" ON public.seo_snapshots
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
      );
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'seo_snapshots' AND policyname = 'seo_snapshots: service role all'
  ) THEN
    CREATE POLICY "seo_snapshots: service role all" ON public.seo_snapshots
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_seo_snapshots_project_time
  ON public.seo_snapshots(project_id, created_at DESC);


-- ── TABLE 7/8: affiliate_links ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  slug                TEXT NOT NULL UNIQUE,
  utm_source          TEXT,
  commission_pct      FLOAT DEFAULT 20.0,
  clicks              INTEGER DEFAULT 0,
  conversions         INTEGER DEFAULT 0,
  total_earned_paise  INTEGER DEFAULT 0,
  status              TEXT DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE','PAUSED','SUSPENDED')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_links' AND policyname = 'user_sees_own_affiliate'
  ) THEN
    CREATE POLICY "user_sees_own_affiliate" ON public.affiliate_links
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_links' AND policyname = 'affiliate_links: service role all'
  ) THEN
    CREATE POLICY "affiliate_links: service role all" ON public.affiliate_links
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ── TABLE 8/8: error_logs ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.error_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  project_id    UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  error_code    TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace   TEXT,
  route         TEXT,
  severity      TEXT NOT NULL DEFAULT 'ERROR'
                CHECK (severity IN ('DEBUG','INFO','WARN','ERROR','FATAL')),
  resolved      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'error_logs' AND policyname = 'admin_only_errors'
  ) THEN
    CREATE POLICY "admin_only_errors" ON public.error_logs
      FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'error_logs' AND policyname = 'error_logs: service role all'
  ) THEN
    CREATE POLICY "error_logs: service role all" ON public.error_logs
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION: 8 new tables created
-- Run: SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- New tables: affiliate_links, error_logs, game_saves,
--   infinite_library_assets, invoices, questionnaire_niche_map,
--   referrals, seo_snapshots
-- ═══════════════════════════════════════════════════════════════
