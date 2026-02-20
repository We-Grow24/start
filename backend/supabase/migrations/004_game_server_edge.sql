-- ═══════════════════════════════════════════════════════════════
-- SVARNEX — MIGRATION 004: HETZNER → SUPABASE EDGE FUNCTION
-- Migrates game_servers table from Hetzner VPS to Edge Function
-- hosting. Adds hosting_provider, edge_function_url columns;
-- makes hetzner_server_id nullable; creates game_saves table.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Add hosting_provider enum and column ───────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hosting_provider_enum') THEN
    CREATE TYPE public.hosting_provider_enum AS ENUM (
      'HETZNER',
      'EDGE_FUNCTION'
    );
  END IF;
END
$$;

ALTER TABLE public.game_servers
  ADD COLUMN IF NOT EXISTS hosting_provider public.hosting_provider_enum
    NOT NULL DEFAULT 'EDGE_FUNCTION';

-- ─── 2. Add edge_function_url column ──────────────────────────

ALTER TABLE public.game_servers
  ADD COLUMN IF NOT EXISTS edge_function_url TEXT;

-- ─── 3. Add chips_per_session column ──────────────────────────
-- Replaces chips_per_hour for session-based billing model.

ALTER TABLE public.game_servers
  ADD COLUMN IF NOT EXISTS chips_per_session INTEGER NOT NULL DEFAULT 2;

-- ─── 4. Make hetzner_server_id nullable ───────────────────────
-- Edge Function servers don't have a Hetzner ID.

ALTER TABLE public.game_servers
  ALTER COLUMN hetzner_server_id DROP NOT NULL;

-- Set default to NULL for new rows
ALTER TABLE public.game_servers
  ALTER COLUMN hetzner_server_id SET DEFAULT NULL;

-- ─── 5. Backfill existing rows ────────────────────────────────
-- Mark all existing servers as HETZNER-hosted

UPDATE public.game_servers
  SET hosting_provider = 'HETZNER'
  WHERE hetzner_server_id IS NOT NULL
    AND hetzner_server_id != 0;

-- ─── 6. Create game_saves table ───────────────────────────────
-- Persistent game state storage for Edge Function rooms.

CREATE TABLE IF NOT EXISTS public.game_saves (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  state_json    JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One save per project (upsert target)
  CONSTRAINT game_saves_project_id_unique UNIQUE (project_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_game_saves_project_id
  ON public.game_saves(project_id);

-- RLS
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

-- Project owners can read their game saves
CREATE POLICY "game_saves_owner_read" ON public.game_saves
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Service role can insert/update (Edge Function uses service role)
CREATE POLICY "game_saves_service_write" ON public.game_saves
  FOR ALL USING (
    (SELECT current_setting('role', true)) = 'service_role'
  );

-- ─── 7. Create decrement_chips RPC ────────────────────────────
-- Used by Edge Function for session billing.

CREATE OR REPLACE FUNCTION public.decrement_chips(
  p_user_id UUID,
  p_amount  INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users_profile
    SET chip_balance = GREATEST(chip_balance - p_amount, 0)
    WHERE id = p_user_id;
END;
$$;

-- ─── 8. Add index for Edge Function server lookups ─────────────

CREATE INDEX IF NOT EXISTS idx_game_servers_hosting_provider
  ON public.game_servers(hosting_provider)
  WHERE status IN ('PROVISIONING', 'RUNNING');

-- ═══════════════════════════════════════════════════════════════
-- END MIGRATION 004
-- ═══════════════════════════════════════════════════════════════
