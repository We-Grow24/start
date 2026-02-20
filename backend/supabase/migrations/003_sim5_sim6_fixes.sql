-- ═══════════════════════════════════════════════════════════════
-- SVARNEX — Migration 003: Simulation 5 + 6 Fixes
-- Run AFTER 001_initial_schema.sql and 002_missing_tables.sql
--
-- Part A: Restructure 6 existing tables (column renames + schema
--         changes to match TypeScript types in types/supabase.ts)
-- Part B: Add new columns to 5 existing tables
-- Part C: Invoice sequence, indexes, constraint updates
-- ═══════════════════════════════════════════════════════════════


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PART A — Restructure existing tables                         ║
-- ║ These tables exist from 001 but have column names / schemas  ║
-- ║ that differ from TypeScript types. We rename, add, and drop  ║
-- ║ to bring them in line.                                       ║
-- ╚═══════════════════════════════════════════════════════════════╝


-- ── A1. export_jobs ──────────────────────────────────────────
-- 001 has: job_id, output_format, status(COMPLETE), chip_cost(CHECK 50-300), expires_at
-- TS needs: id, format, status(DONE), chip_cost (no range CHECK), download_expires_at,
--           error_message, completed_at

-- Rename PK column
ALTER TABLE public.export_jobs RENAME COLUMN job_id TO id;

-- Rename columns
ALTER TABLE public.export_jobs RENAME COLUMN output_format TO format;
ALTER TABLE public.export_jobs RENAME COLUMN expires_at TO download_expires_at;

-- Add missing columns
ALTER TABLE public.export_jobs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE public.export_jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Drop all CHECK constraints, add correct ones
DO $$ DECLARE rec RECORD;
BEGIN
  FOR rec IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.export_jobs'::regclass AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.export_jobs DROP CONSTRAINT %I', rec.conname);
  END LOOP;
END $$;

ALTER TABLE public.export_jobs ADD CONSTRAINT export_jobs_status_check
  CHECK (status IN ('QUEUED','PROCESSING','DONE','FAILED'));
ALTER TABLE public.export_jobs ADD CONSTRAINT export_jobs_format_check
  CHECK (format IN ('ZIP','APK','IPA','WASM'));


-- ── A2. game_servers ─────────────────────────────────────────
-- 001 has: server_id, user_id(NOT NULL), hetzner_server_id(TEXT), ip_address(TEXT),
--          status(STARTING/RUNNING/IDLE/STOPPED), chips_burned, started_at, stopped_at
-- TS needs: id (no user_id), hetzner_server_id(INTEGER), ipv4_address,
--           status(PROVISIONING/RUNNING/STOPPING/STOPPED/ERROR),
--           max_players, chips_per_hour, billing_started_at, last_heartbeat_at, idle_since_at

-- Rename PK
ALTER TABLE public.game_servers RENAME COLUMN server_id TO id;

-- Make user_id nullable (exists in DB but not in TS types; retained for DB-level integrity)
ALTER TABLE public.game_servers ALTER COLUMN user_id DROP NOT NULL;

-- Rename columns
ALTER TABLE public.game_servers RENAME COLUMN ip_address TO ipv4_address;
ALTER TABLE public.game_servers RENAME COLUMN started_at TO billing_started_at;

-- Keep chips_burned for historical billing totals; add chips_per_hour as the rate column
ALTER TABLE public.game_servers ADD COLUMN IF NOT EXISTS chips_per_hour INTEGER DEFAULT 5;

-- Type change: hetzner_server_id TEXT → INTEGER
ALTER TABLE public.game_servers ALTER COLUMN hetzner_server_id
  SET DATA TYPE INTEGER USING NULLIF(REGEXP_REPLACE(hetzner_server_id, '[^0-9]', '', 'g'), '')::INTEGER;

-- Add missing columns
ALTER TABLE public.game_servers ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 50;
ALTER TABLE public.game_servers ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ;
ALTER TABLE public.game_servers ADD COLUMN IF NOT EXISTS idle_since_at TIMESTAMPTZ;

-- Drop all CHECK constraints, add new status CHECK
DO $$ DECLARE rec RECORD;
BEGIN
  FOR rec IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.game_servers'::regclass AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.game_servers DROP CONSTRAINT %I', rec.conname);
  END LOOP;
END $$;

ALTER TABLE public.game_servers ADD CONSTRAINT game_servers_status_check
  CHECK (status IN ('PROVISIONING','RUNNING','STOPPING','STOPPED','ERROR'));

-- Extra RLS: project-owner policy (alongside existing user-based policy)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'game_servers' AND policyname = 'project_owner_sees_server'
  ) THEN
    CREATE POLICY "project_owner_sees_server" ON public.game_servers
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_game_servers_project_status
  ON public.game_servers(project_id, status);


-- ── A3. domain_configs ───────────────────────────────────────
-- 001 has: config_id, user_id, custom_domain, dns_status(PENDING/PROPAGATED/FAILED),
--          a_record_ip, ssl_status(PENDING/ACTIVE)
-- TS needs: id, domain, subdomain, cname_target, txt_verification,
--           status(PENDING/VERIFYING/ACTIVE/FAILED/EXPIRED),
--           ssl_status(PENDING/ISSUED/ERROR), vercel_domain_id, verify_attempts,
--           last_checked_at, verified_at, expires_at

-- Rename PK
ALTER TABLE public.domain_configs RENAME COLUMN config_id TO id;

-- Rename columns
ALTER TABLE public.domain_configs RENAME COLUMN custom_domain TO domain;
ALTER TABLE public.domain_configs RENAME COLUMN dns_status TO status;

-- Make user_id nullable (not in TS types; retained for DB-level integrity)
ALTER TABLE public.domain_configs ALTER COLUMN user_id DROP NOT NULL;

-- Add new columns
ALTER TABLE public.domain_configs ADD COLUMN IF NOT EXISTS subdomain TEXT;
ALTER TABLE public.domain_configs ADD COLUMN IF NOT EXISTS cname_target TEXT NOT NULL DEFAULT 'cname.vercel-dns.com';
ALTER TABLE public.domain_configs ADD COLUMN IF NOT EXISTS txt_verification TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex');
ALTER TABLE public.domain_configs ADD COLUMN IF NOT EXISTS vercel_domain_id TEXT;
ALTER TABLE public.domain_configs ADD COLUMN IF NOT EXISTS verify_attempts INTEGER DEFAULT 0;
ALTER TABLE public.domain_configs ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;
ALTER TABLE public.domain_configs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '72 hours';

-- Drop all CHECK constraints, add new ones
DO $$ DECLARE rec RECORD;
BEGIN
  FOR rec IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.domain_configs'::regclass AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.domain_configs DROP CONSTRAINT %I', rec.conname);
  END LOOP;
END $$;

ALTER TABLE public.domain_configs ADD CONSTRAINT domain_configs_status_check
  CHECK (status IN ('PENDING','VERIFYING','ACTIVE','FAILED','EXPIRED'));
ALTER TABLE public.domain_configs ADD CONSTRAINT domain_configs_ssl_status_check
  CHECK (ssl_status IN ('PENDING','ISSUED','ERROR'));

-- Update UNIQUE constraint: project_id + domain
ALTER TABLE public.domain_configs DROP CONSTRAINT IF EXISTS domain_configs_project_id_custom_domain_key;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.domain_configs'::regclass
    AND conname = 'domain_configs_project_id_domain_key'
  ) THEN
    ALTER TABLE public.domain_configs ADD CONSTRAINT domain_configs_project_id_domain_key
      UNIQUE (project_id, domain);
  END IF;
END $$;

-- RLS: project-owner policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'domain_configs' AND policyname = 'owner_manages_domains'
  ) THEN
    CREATE POLICY "owner_manages_domains" ON public.domain_configs
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
      );
  END IF;
END $$;


-- ── A4. geo_rules ────────────────────────────────────────────
-- 001 has: rule_id, condition_type, condition_value, action_type, action_value, priority, is_active
-- TS needs: id, country_code, rule_type, target_block_id, replacement_dna,
--           currency_override, redirect_url, active
-- Strategy: Keep old columns for backward compat, add new columns, migrate data.

-- Rename PK
ALTER TABLE public.geo_rules RENAME COLUMN rule_id TO id;

-- Add new TS-facing columns (keep condition_type, condition_value, is_active for compat)
ALTER TABLE public.geo_rules ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE public.geo_rules ADD COLUMN IF NOT EXISTS rule_type TEXT;
ALTER TABLE public.geo_rules ADD COLUMN IF NOT EXISTS target_block_id TEXT;
ALTER TABLE public.geo_rules ADD COLUMN IF NOT EXISTS replacement_dna JSONB;
ALTER TABLE public.geo_rules ADD COLUMN IF NOT EXISTS currency_override TEXT;
ALTER TABLE public.geo_rules ADD COLUMN IF NOT EXISTS redirect_url TEXT;
ALTER TABLE public.geo_rules ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Migrate existing data from old columns into new columns
UPDATE public.geo_rules SET country_code = condition_value
  WHERE condition_type = 'COUNTRY' AND country_code IS NULL;
UPDATE public.geo_rules SET rule_type = 'LANG_REDIRECT'
  WHERE condition_type = 'LANGUAGE' AND rule_type IS NULL;
UPDATE public.geo_rules SET rule_type = 'PRICE_OVERRIDE'
  WHERE condition_type = 'COUNTRY' AND rule_type IS NULL;
UPDATE public.geo_rules SET active = is_active
  WHERE active IS NULL AND is_active IS NOT NULL;

-- Add CHECK only on the new rule_type column (old condition_type CHECK stays)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.geo_rules'::regclass
    AND conname = 'geo_rules_rule_type_check'
  ) THEN
    ALTER TABLE public.geo_rules ADD CONSTRAINT geo_rules_rule_type_check
      CHECK (rule_type IN ('BLOCK_SHOW','PRICE_OVERRIDE','LANG_REDIRECT','CTA_REPLACE'));
  END IF;
END $$;


-- ── A5. gso_variants ─────────────────────────────────────────
-- 001 has: variant_id, segment_type, condition_value(TEXT), is_active
-- TS needs: id, variant_name, dna_branch(JSONB), impressions, conversions, is_control, is_winner

-- Rename PK
ALTER TABLE public.gso_variants RENAME COLUMN variant_id TO id;

-- Rename columns
ALTER TABLE public.gso_variants RENAME COLUMN segment_type TO variant_name;

-- dna_branch already exists as JSONB. condition_value is TEXT — rename it.
ALTER TABLE public.gso_variants DROP COLUMN IF EXISTS condition_value;

-- Add missing columns (dna_branch already exists from 001 as JSONB)
ALTER TABLE public.gso_variants ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;
ALTER TABLE public.gso_variants ADD COLUMN IF NOT EXISTS conversions INTEGER DEFAULT 0;
ALTER TABLE public.gso_variants ADD COLUMN IF NOT EXISTS is_control BOOLEAN DEFAULT false;
ALTER TABLE public.gso_variants ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT false;

-- Drop is_active (not in TS types)
ALTER TABLE public.gso_variants DROP COLUMN IF EXISTS is_active;

-- Drop all CHECK constraints (old segment_type CHECKs)
DO $$ DECLARE rec RECORD;
BEGIN
  FOR rec IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.gso_variants'::regclass AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.gso_variants DROP CONSTRAINT %I', rec.conname);
  END LOOP;
END $$;


-- ── A6. integrations ─────────────────────────────────────────
-- 001 has: integration_id, provider, encrypted_token, token_iv, scope(TEXT),
--          connected_at, last_refreshed_at, UNIQUE(user_id, provider)
-- TS needs: id, service, access_token_enc, refresh_token_enc, project_id,
--           scope(TEXT[]), account_id, account_label, expires_at,
--           UNIQUE(user_id, service, COALESCE(project_id, ...))

-- Rename PK
ALTER TABLE public.integrations RENAME COLUMN integration_id TO id;

-- Rename columns
ALTER TABLE public.integrations RENAME COLUMN provider TO service;
ALTER TABLE public.integrations RENAME COLUMN encrypted_token TO access_token_enc;
ALTER TABLE public.integrations RENAME COLUMN token_iv TO refresh_token_enc;

-- Type change: scope TEXT → TEXT[] (drop and re-add)
ALTER TABLE public.integrations DROP COLUMN IF EXISTS scope;
ALTER TABLE public.integrations ADD COLUMN scope TEXT[];

-- Keep connected_at and last_refreshed_at for backward compat (no TS references, no conflict)

-- Add new columns
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS project_id UUID
  REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS account_id TEXT;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS account_label TEXT;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Drop all CHECK constraints, add new service CHECK
DO $$ DECLARE rec RECORD;
BEGIN
  FOR rec IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.integrations'::regclass AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.integrations DROP CONSTRAINT %I', rec.conname);
  END LOOP;
END $$;

ALTER TABLE public.integrations ADD CONSTRAINT integrations_service_check
  CHECK (service IN (
    'RAZORPAY','GOOGLE_CALENDAR','WHATSAPP','GITHUB',
    'OPENAI','STRIPE','SLACK','GOOGLE_ANALYTICS'
  ));

-- Update UNIQUE: user_id + service + project (use INDEX — COALESCE not allowed in ADD CONSTRAINT)
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS integrations_user_id_provider_key;
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS integrations_user_service_project_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_unique_user_service_project
  ON public.integrations(
    user_id,
    service,
    COALESCE(project_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_integrations_user_service
  ON public.integrations(user_id, service);


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PART B — Add new columns to existing tables                  ║
-- ╚═══════════════════════════════════════════════════════════════╝


-- ── B1. users_profile — Sim 5+6 columns ─────────────────────
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS payment_retry_count INTEGER DEFAULT 0;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS last_payment_retry_at TIMESTAMPTZ;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS onboarding_channel TEXT DEFAULT 'WEB';
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS pixel_nps_shown_at TIMESTAMPTZ;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS t2fp_first_deploy_at TIMESTAMPTZ;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS totp_secret_enc TEXT;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS totp_verified_at TIMESTAMPTZ;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS nps_score INTEGER;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS nps_submitted_at TIMESTAMPTZ;

-- Check constraints for new columns
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.users_profile'::regclass
    AND conname = 'users_profile_onboarding_channel_check'
  ) THEN
    ALTER TABLE public.users_profile ADD CONSTRAINT users_profile_onboarding_channel_check
      CHECK (onboarding_channel IN ('WEB','WHATSAPP'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.users_profile'::regclass
    AND conname = 'users_profile_nps_score_check'
  ) THEN
    ALTER TABLE public.users_profile ADD CONSTRAINT users_profile_nps_score_check
      CHECK (nps_score BETWEEN 0 AND 10);
  END IF;
END $$;

-- Add TRIALING to subscription_status CHECK
ALTER TABLE public.users_profile DROP CONSTRAINT IF EXISTS users_profile_subscription_status_check;
ALTER TABLE public.users_profile ADD CONSTRAINT users_profile_subscription_status_check
  CHECK (subscription_status IN ('ACTIVE','INACTIVE','PAST_DUE','CANCELLED','HALTED','TRIALING'));


-- ── B2. projects — Sim 5+6 columns ──────────────────────────
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pixel_secret UUID DEFAULT gen_random_uuid();
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS domain_status TEXT DEFAULT 'NONE';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS domain_verify_attempts INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS eas_build_id TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS eas_build_timeout_at TIMESTAMPTZ;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pwa_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS built_with_badge_enabled BOOLEAN DEFAULT true;

-- Add DELETED to status CHECK + domain_status CHECK
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check
  CHECK (status IN ('IN_PROGRESS','DEPLOYED','ARCHIVED','QUARANTINED','DELETED'));

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.projects'::regclass
    AND conname = 'projects_domain_status_check'
  ) THEN
    ALTER TABLE public.projects ADD CONSTRAINT projects_domain_status_check
      CHECK (domain_status IN ('NONE','PENDING','VERIFYING','ACTIVE','FAILED'));
  END IF;
END $$;


-- ── B3. infinite_library_blocks — deprecation columns ────────
ALTER TABLE public.infinite_library_blocks ADD COLUMN IF NOT EXISTS is_deprecated BOOLEAN DEFAULT false;
ALTER TABLE public.infinite_library_blocks ADD COLUMN IF NOT EXISTS deprecated_at TIMESTAMPTZ;
ALTER TABLE public.infinite_library_blocks ADD COLUMN IF NOT EXISTS successor_block_id UUID
  REFERENCES public.infinite_library_blocks(block_id);


-- ── B4. materialise_jobs — EAS build columns ─────────────────
ALTER TABLE public.materialise_jobs ADD COLUMN IF NOT EXISTS eas_build_id TEXT;
ALTER TABLE public.materialise_jobs ADD COLUMN IF NOT EXISTS eas_build_timeout_at TIMESTAMPTZ;


-- ── B5. device_trust — hw_salt for hardware hash ─────────────
ALTER TABLE public.device_trust ADD COLUMN IF NOT EXISTS hw_salt TEXT
  DEFAULT encode(gen_random_bytes(16), 'hex');


-- ── B6. referrals — referee reward column ────────────────────
-- Safety: in case 002 table was created from a partial 001 without this column
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS referee_chips_awarded INTEGER DEFAULT 0;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║ PART C — Sequences, indexes, constraints                     ║
-- ╚═══════════════════════════════════════════════════════════════╝


-- ── C1. GST Invoice number sequence ──────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1000 INCREMENT 1;

-- Update invoice_number default to use the schema-qualified sequence
DO $$ BEGIN
  ALTER TABLE public.invoices ALTER COLUMN invoice_number
    SET DEFAULT 'SVX-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('public.invoice_number_seq')::TEXT, 6, '0');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ── C2. Cursor-based pagination indexes ──────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_cursor
  ON public.projects(user_id, created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_vault_templates_cursor
  ON public.vault_templates(created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_agent_tickets_cursor
  ON public.agent_task_tickets(created_at DESC, id);


-- ── C3. Additional performance indexes ───────────────────────
CREATE INDEX IF NOT EXISTS idx_export_jobs_user
  ON public.export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status
  ON public.export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_domain_configs_project
  ON public.domain_configs(project_id);
CREATE INDEX IF NOT EXISTS idx_geo_rules_project
  ON public.geo_rules(project_id, active);
CREATE INDEX IF NOT EXISTS idx_gso_variants_project
  ON public.gso_variants(project_id);


-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION
-- Run:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'export_jobs' ORDER BY ordinal_position;
--
-- Restructured table PKs: export_jobs.id, game_servers.id,
--   domain_configs.id, geo_rules.id, gso_variants.id, integrations.id
--
-- New cols on users_profile: payment_retry_count, last_payment_retry_at,
--   onboarding_channel, pixel_nps_shown_at, t2fp_first_deploy_at,
--   totp_secret_enc, totp_enabled, totp_verified_at, nps_score, nps_submitted_at
--
-- New cols on projects: pixel_secret, domain_status, domain_verify_attempts,
--   eas_build_id, eas_build_timeout_at, pwa_enabled, built_with_badge_enabled
-- ═══════════════════════════════════════════════════════════════
