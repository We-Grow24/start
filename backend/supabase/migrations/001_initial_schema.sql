-- ════════════════════════════════════════════════════════════════════════════
-- SVARNEX — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Core tables: 17 (PRD SVX-001 required)  +  9 extras = 26 total
-- All tables: RLS enabled, service_role bypass, created_at + updated_at
-- ════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS vector;

-- ────────────────────────────────── helper ──────────────────────────────────
-- Reusable trigger function for updated_at auto-set
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 1/17 — users_profile
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.users_profile (
  id                       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  chip_balance             INTEGER     NOT NULL DEFAULT 0 CHECK (chip_balance >= 0),
  subscription_tier        TEXT        NOT NULL DEFAULT 'PRESENCE'
                                       CHECK (subscription_tier IN ('PRESENCE','BUSINESS','SCALE')),
  subscription_status      TEXT        NOT NULL DEFAULT 'INACTIVE'
                                       CHECK (subscription_status IN ('ACTIVE','INACTIVE','PAST_DUE','CANCELLED','HALTED')),
  razorpay_subscription_id TEXT,
  role                     TEXT        NOT NULL DEFAULT 'user'
                                       CHECK (role IN ('user','admin','founder')),
  is_disputed              BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER users_profile_set_updated_at BEFORE UPDATE ON public.users_profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "users_profile: user reads own"  ON public.users_profile FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_profile: user updates own" ON public.users_profile FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_profile: service role all" ON public.users_profile FOR ALL   USING (auth.role() = 'service_role');

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users_profile (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 2/17 — projects
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.projects (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_type    TEXT        NOT NULL CHECK (zone_type IN ('FORGE','FOUNDRY','ENGINE','BAZAAR','LOGIC')),
  dna_string   JSONB       NOT NULL DEFAULT '{}',
  status       TEXT        NOT NULL DEFAULT 'IN_PROGRESS'
               CHECK (status IN ('IN_PROGRESS','DEPLOYED','ARCHIVED','QUARANTINED')),
  version      INTEGER     NOT NULL DEFAULT 1,
  slug         TEXT        UNIQUE NOT NULL,
  domain       TEXT,
  deployed_url TEXT,
  materialize_chip_cost INTEGER NOT NULL DEFAULT 10,
  deploy_chip_cost      INTEGER NOT NULL DEFAULT 25,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status  ON public.projects(user_id, status);
CREATE INDEX idx_projects_slug    ON public.projects(slug);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "projects: user reads own"   ON public.projects FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "projects: user inserts own"  ON public.projects FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "projects: user updates own"  ON public.projects FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "projects: user deletes own"  ON public.projects FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "projects: service role all"  ON public.projects FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 3/17 — dna_blocks
-- Individual DNA building blocks for a project's DNA tree.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.dna_blocks (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  block_type      TEXT        NOT NULL,
  props           JSONB       NOT NULL DEFAULT '{}',
  parent_block_id UUID        REFERENCES public.dna_blocks(id) ON DELETE SET NULL,
  position        INTEGER     NOT NULL DEFAULT 0,
  metadata        JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dna_blocks_project ON public.dna_blocks(project_id);
CREATE INDEX idx_dna_blocks_parent  ON public.dna_blocks(parent_block_id);
ALTER TABLE public.dna_blocks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER dna_blocks_set_updated_at BEFORE UPDATE ON public.dna_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "dna_blocks: user reads own"   ON public.dna_blocks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "dna_blocks: user inserts own"  ON public.dna_blocks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "dna_blocks: user updates own"  ON public.dna_blocks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "dna_blocks: user deletes own"  ON public.dna_blocks FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "dna_blocks: service role all"  ON public.dna_blocks FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 4/17 — dna_mutations
-- Logs every DNA mutation applied to a project.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.dna_mutations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id     TEXT        NOT NULL,
  prompt      TEXT,
  previous_props JSONB,
  new_props   JSONB,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dna_mutations_project ON public.dna_mutations(project_id);
ALTER TABLE public.dna_mutations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER dna_mutations_set_updated_at BEFORE UPDATE ON public.dna_mutations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "mutations: user reads own"   ON public.dna_mutations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "mutations: user inserts own"  ON public.dna_mutations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "mutations: service role all"  ON public.dna_mutations FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 5/17 — dna_sessions
-- DNA editing sessions with snapshot history.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.dna_sessions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dna_snapshot JSONB      NOT NULL DEFAULT '{}',
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dna_sessions_project ON public.dna_sessions(project_id);
ALTER TABLE public.dna_sessions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER dna_sessions_set_updated_at BEFORE UPDATE ON public.dna_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "dna_sessions: user reads own"   ON public.dna_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "dna_sessions: user inserts own"  ON public.dna_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "dna_sessions: user updates own"  ON public.dna_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "dna_sessions: service role all"  ON public.dna_sessions FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 6/17 — device_trust
-- Hardware-bound device registry. Max 3 per user.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.device_trust (
  trust_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hw_hash      TEXT        NOT NULL,
  device_label TEXT        NOT NULL DEFAULT 'My Device',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, hw_hash)
);
CREATE INDEX idx_device_trust_user ON public.device_trust(user_id);
ALTER TABLE public.device_trust ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER device_trust_set_updated_at BEFORE UPDATE ON public.device_trust
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "device_trust: user reads own"   ON public.device_trust FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "device_trust: user inserts own"  ON public.device_trust FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "device_trust: user deletes own"  ON public.device_trust FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "device_trust: user updates own"  ON public.device_trust FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "device_trust: service role all"  ON public.device_trust FOR ALL    USING (auth.role() = 'service_role');

-- SVX-002 Trigger: enforce_max_device_trust (exact PRD name + error message)
CREATE OR REPLACE FUNCTION public.enforce_max_device_trust()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE device_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO device_count
  FROM public.device_trust WHERE user_id = NEW.user_id;
  IF device_count >= 3 THEN
    RAISE EXCEPTION 'max_devices_reached'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER device_trust_max_3
  BEFORE INSERT ON public.device_trust
  FOR EACH ROW EXECUTE FUNCTION public.enforce_max_device_trust();


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 7/17 — oracle_sessions
-- AI assistant conversation sessions.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.oracle_sessions (
  session_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation       JSONB       NOT NULL DEFAULT '[]',
  call_count         INTEGER     NOT NULL DEFAULT 0,
  session_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_call_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);
CREATE INDEX idx_oracle_user    ON public.oracle_sessions(user_id);
CREATE INDEX idx_oracle_project ON public.oracle_sessions(project_id);
ALTER TABLE public.oracle_sessions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER oracle_sessions_set_updated_at BEFORE UPDATE ON public.oracle_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "oracle: user reads own"   ON public.oracle_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "oracle: user inserts own"  ON public.oracle_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "oracle: user updates own"  ON public.oracle_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "oracle: service role all"  ON public.oracle_sessions FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 8/17 — oracle_messages
-- Individual oracle chat messages (user + assistant).
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.oracle_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        NOT NULL REFERENCES public.oracle_sessions(session_id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  UUID        REFERENCES public.projects(id) ON DELETE SET NULL,
  role        TEXT        NOT NULL CHECK (role IN ('user','assistant')),
  content     TEXT        NOT NULL DEFAULT '',
  chip_cost   INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_oracle_messages_session ON public.oracle_messages(session_id);
CREATE INDEX idx_oracle_messages_user    ON public.oracle_messages(user_id);
ALTER TABLE public.oracle_messages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER oracle_messages_set_updated_at BEFORE UPDATE ON public.oracle_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "oracle_msg: user reads own"   ON public.oracle_messages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "oracle_msg: user inserts own"  ON public.oracle_messages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "oracle_msg: service role all"  ON public.oracle_messages FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 9/17 — casino_ledger
-- 2-phase commit transaction log.
-- States: PENDING → COMMITTED (Phase 2 webhook received)
--         PENDING → ROLLEDBACK (120s timeout, no webhook)
--         PENDING → FAILED (explicit deploy error webhook)
--         ROLLEDBACK → COMMITTED (async background confirm)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.casino_ledger (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id       UUID        REFERENCES public.projects(id) ON DELETE SET NULL,
  amount           INTEGER     NOT NULL CHECK (amount > 0),
  transaction_type TEXT        NOT NULL
                   CHECK (transaction_type IN (
                     'MATERIALISATION','DEPLOY','ORACLE_CALL','EXPORT',
                     'GAME_SERVER','VAULT_PURCHASE','TOPUP','GEO_RULE',
                     'GSO_VARIANT','SIMULATION_RERUN','SUBSCRIPTION',
                     'REFERRAL_REWARD','ROLLOVER_EXPIRE','ROLLOVER_GRANT'
                   )),
  status           TEXT        NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','COMMITTED','ROLLEDBACK','FAILED')),
  phase1_at        TIMESTAMPTZ,
  phase2_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ledger_user_id ON public.casino_ledger(user_id);
CREATE INDEX idx_ledger_status  ON public.casino_ledger(status);
CREATE INDEX idx_ledger_project ON public.casino_ledger(project_id);
ALTER TABLE public.casino_ledger ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER casino_ledger_set_updated_at BEFORE UPDATE ON public.casino_ledger
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "ledger: user reads own"    ON public.casino_ledger FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ledger: user inserts own"   ON public.casino_ledger FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "ledger: service role all"   ON public.casino_ledger FOR ALL    USING (auth.role() = 'service_role');

-- SVX-002 Trigger: casino_ledger_state_machine
-- Valid transitions:
--   PENDING    → COMMITTED  (Phase 2 webhook received)
--   PENDING    → ROLLEDBACK (120s timeout, no webhook)
--   PENDING    → FAILED     (explicit deploy error webhook)
--   ROLLEDBACK → COMMITTED  (async background confirm)
--   Terminal: COMMITTED, FAILED → blocked (unless ROLLEDBACK→COMMITTED)
CREATE OR REPLACE FUNCTION public.casino_ledger_state_machine()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Terminal states block all transitions (except ROLLEDBACK→COMMITTED)
  IF OLD.status IN ('COMMITTED','FAILED') THEN
    RAISE EXCEPTION 'invalid_ledger_transition'
      USING DETAIL = format('Cannot transition from %s to %s', OLD.status, NEW.status);
  END IF;

  -- PENDING transitions
  IF OLD.status = 'PENDING' THEN
    IF NEW.status NOT IN ('COMMITTED','ROLLEDBACK','FAILED') THEN
      RAISE EXCEPTION 'invalid_ledger_transition'
        USING DETAIL = format('Cannot transition from PENDING to %s', NEW.status);
    END IF;

    IF NEW.status = 'COMMITTED' THEN
      NEW.phase2_at = NOW();
      IF NEW.transaction_type IN ('TOPUP','SUBSCRIPTION','REFERRAL_REWARD','ROLLOVER_GRANT') THEN
        UPDATE public.users_profile SET chip_balance = chip_balance + NEW.amount WHERE id = NEW.user_id;
      ELSE
        UPDATE public.users_profile
        SET chip_balance = chip_balance - NEW.amount
        WHERE id = NEW.user_id AND chip_balance >= NEW.amount;
        IF NOT FOUND THEN
          NEW.status = 'FAILED';
          RAISE WARNING 'casino_ledger: insufficient chip balance for user %', NEW.user_id;
        END IF;
      END IF;
    END IF;

    IF NEW.status = 'ROLLEDBACK' THEN
      NEW.phase2_at = NOW();
    END IF;
  END IF;

  -- ROLLEDBACK → COMMITTED (async background confirm)
  IF OLD.status = 'ROLLEDBACK' THEN
    IF NEW.status <> 'COMMITTED' THEN
      RAISE EXCEPTION 'invalid_ledger_transition'
        USING DETAIL = format('Cannot transition from ROLLEDBACK to %s', NEW.status);
    END IF;

    NEW.phase2_at = NOW();

    IF NEW.transaction_type IN ('TOPUP','SUBSCRIPTION','REFERRAL_REWARD','ROLLOVER_GRANT') THEN
      UPDATE public.users_profile SET chip_balance = chip_balance + NEW.amount WHERE id = NEW.user_id;
    ELSE
      UPDATE public.users_profile
      SET chip_balance = chip_balance - NEW.amount
      WHERE id = NEW.user_id AND chip_balance >= NEW.amount;
      IF NOT FOUND THEN
        NEW.status = 'FAILED';
        RAISE WARNING 'casino_ledger: insufficient chip balance for user %', NEW.user_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER casino_ledger_2pc
  BEFORE UPDATE ON public.casino_ledger
  FOR EACH ROW EXECUTE FUNCTION public.casino_ledger_state_machine();


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 10/17 — chip_packages (REPLACED — new schema with display prices)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.chip_packages (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  chips          INTEGER     NOT NULL CHECK (chips > 0),
  price_paise    INTEGER     NOT NULL CHECK (price_paise > 0),
  price_display  TEXT        NOT NULL,
  is_popular     BOOLEAN     DEFAULT false,
  is_starter     BOOLEAN     DEFAULT false,
  tier_highlight TEXT,
  active         BOOLEAN     DEFAULT true,
  sort_order     INTEGER     DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.chip_packages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER chip_packages_set_updated_at BEFORE UPDATE ON public.chip_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "chip_packages: public reads" ON public.chip_packages FOR SELECT USING (true);
CREATE POLICY "chip_packages: service role all" ON public.chip_packages FOR ALL
  USING (auth.role() = 'service_role');

-- Seed default packages
INSERT INTO public.chip_packages (name, chips, price_paise, price_display, is_starter, sort_order)
VALUES
  ('Try It Out',    25,   4900,  '₹49',    true,  1),
  ('Starter',      100,   9900,  '₹99',    false, 2),
  ('Builder',      350,  29900,  '₹299',   false, 3),
  ('Creator',      800,  59900,  '₹599',   false, 4),
  ('Studio',      2000, 149900, '₹1,499',  true,  5);


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 11/17 — deploy_jobs
-- Deployment job tracking for Vercel deployments.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.deploy_jobs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          TEXT        NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','DEPLOYING','DEPLOYED','FAILED','PAYMENT_CONFIRMED')),
  vercel_deploy_id TEXT,
  vercel_url       TEXT,
  chip_cost        INTEGER     NOT NULL DEFAULT 25,
  ledger_entry_id  UUID        REFERENCES public.casino_ledger(id),
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  deployed_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_deploy_jobs_project ON public.deploy_jobs(project_id);
CREATE INDEX idx_deploy_jobs_user    ON public.deploy_jobs(user_id);
CREATE INDEX idx_deploy_jobs_status  ON public.deploy_jobs(status);
ALTER TABLE public.deploy_jobs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER deploy_jobs_set_updated_at BEFORE UPDATE ON public.deploy_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "deploy_jobs: user reads own"   ON public.deploy_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "deploy_jobs: user inserts own"  ON public.deploy_jobs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "deploy_jobs: service role all"  ON public.deploy_jobs FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 12/17 — materialise_jobs  (PRD name; was materialise_queue)
-- 3-phase materialisation: A (Genetic Assembly), B (Ghost Injection),
-- C (Polymorphic Shield). Auto-quarantine after 3 failures.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.materialise_jobs (
  job_id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase        TEXT        NOT NULL CHECK (phase IN ('A','B','C')),
  status       TEXT        NOT NULL DEFAULT 'PENDING'
               CHECK (status IN ('PENDING','RUNNING','PASSED','FAILED','QUARANTINED')),
  agent_logs   JSONB       NOT NULL DEFAULT '[]',
  retry_count  INTEGER     NOT NULL DEFAULT 0 CHECK (retry_count <= 3),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_matjobs_project ON public.materialise_jobs(project_id);
CREATE INDEX idx_matjobs_status  ON public.materialise_jobs(status);
ALTER TABLE public.materialise_jobs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER materialise_jobs_set_updated_at BEFORE UPDATE ON public.materialise_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "matjobs: user reads own"     ON public.materialise_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "matjobs: service role all"    ON public.materialise_jobs FOR ALL    USING (auth.role() = 'service_role');

-- Auto-quarantine on 3rd failure
CREATE OR REPLACE FUNCTION public.materialise_auto_quarantine()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'FAILED' AND NEW.retry_count >= 3 THEN
    NEW.status = 'QUARANTINED';
    UPDATE public.projects SET status = 'QUARANTINED' WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER matjobs_quarantine
  BEFORE UPDATE OF status ON public.materialise_jobs
  FOR EACH ROW EXECUTE FUNCTION public.materialise_auto_quarantine();


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 13/17 — seo_scores  (PRD name; was seo_snapshots)
-- Automated SEO audit snapshots.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.seo_scores (
  snapshot_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  seo_score        INTEGER     NOT NULL CHECK (seo_score BETWEEN 0 AND 100),
  meta_title       TEXT,
  meta_description TEXT,
  sitemap_url      TEXT,
  og_image_url     TEXT,
  issues           JSONB       NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_seo_project    ON public.seo_scores(project_id);
CREATE INDEX idx_seo_created_at ON public.seo_scores(project_id, created_at DESC);
ALTER TABLE public.seo_scores ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER seo_scores_set_updated_at BEFORE UPDATE ON public.seo_scores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "seo: project owner reads" ON public.seo_scores FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "seo: service role all"    ON public.seo_scores FOR ALL
  USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 14/17 — questionnaire_answers
-- Forge zone questionnaire responses.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.questionnaire_answers (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers     JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_questionnaire_project ON public.questionnaire_answers(project_id);
ALTER TABLE public.questionnaire_answers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER questionnaire_answers_set_updated_at BEFORE UPDATE ON public.questionnaire_answers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "questionnaire: user reads own"   ON public.questionnaire_answers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "questionnaire: user inserts own"  ON public.questionnaire_answers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "questionnaire: user updates own"  ON public.questionnaire_answers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "questionnaire: service role all"  ON public.questionnaire_answers FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 15/17 — analytics_events
-- Pixel events from analytics ingestion endpoint.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.analytics_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  event_type      TEXT        NOT NULL,
  page_url        TEXT,
  element_id      TEXT,
  x               INTEGER,
  y               INTEGER,
  viewport_width  INTEGER,
  viewport_height INTEGER,
  session_id      TEXT,
  user_agent      TEXT,
  metadata        JSONB,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_analytics_project ON public.analytics_events(project_id);
CREATE INDEX idx_analytics_type    ON public.analytics_events(project_id, event_type);
CREATE INDEX idx_analytics_ts      ON public.analytics_events(timestamp DESC);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER analytics_events_set_updated_at BEFORE UPDATE ON public.analytics_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "analytics: project owner reads" ON public.analytics_events FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "analytics: service role all"    ON public.analytics_events FOR ALL
  USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 16/17 — infinite_library_blocks  (PRD name; was infinite_library)
-- Central DNA block repository. pgvector embeddings for semantic search.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.infinite_library_blocks (
  block_id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type     TEXT        NOT NULL,
  zone_type      TEXT        NOT NULL
                 CHECK (zone_type IN ('FORGE','FOUNDRY','ENGINE','BAZAAR','LOGIC','UNIVERSAL')),
  dna_blueprint  JSONB       NOT NULL DEFAULT '{}',
  code_react     TEXT,
  code_flutter   TEXT,
  vibe_embedding vector(1536),
  species_name   TEXT        UNIQUE,
  license        TEXT        NOT NULL DEFAULT 'MIT'
                 CHECK (license IN ('MIT','APACHE_2','BSD')),
  version        TEXT        NOT NULL DEFAULT 'v1.0',
  status         TEXT        NOT NULL DEFAULT 'ACTIVE'
                 CHECK (status IN ('ACTIVE','ARCHIVED')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_library_embedding ON public.infinite_library_blocks
  USING hnsw (vibe_embedding vector_cosine_ops);
CREATE INDEX idx_library_zone_type ON public.infinite_library_blocks(zone_type, status);
ALTER TABLE public.infinite_library_blocks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER infinite_library_blocks_set_updated_at BEFORE UPDATE ON public.infinite_library_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "library: authenticated reads active" ON public.infinite_library_blocks FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'ACTIVE');
CREATE POLICY "library: service role all"           ON public.infinite_library_blocks FOR ALL
  USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 17/17 — consent_records
-- DPDPA 2023 consent tracking.
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.consent_records (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type  TEXT        NOT NULL,
  consented_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_consent_user ON public.consent_records(user_id);
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER consent_records_set_updated_at BEFORE UPDATE ON public.consent_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "consent: user reads own"   ON public.consent_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "consent: user inserts own"  ON public.consent_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "consent: service role all"  ON public.consent_records FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- EXTRA TABLE 18 — vault_templates (REPLACED — full Bazaar/Vault schema)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.vault_templates (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID        REFERENCES public.projects(id) ON DELETE SET NULL,
  seller_id            UUID        NOT NULL REFERENCES public.users_profile(id),
  buyer_user_id        UUID        REFERENCES public.users_profile(id),
  title                TEXT        NOT NULL,
  description          TEXT,
  zone_type            TEXT        NOT NULL CHECK (zone_type IN ('FORGE','FOUNDRY','ENGINE','BAZAAR','LOGIC')),
  tier                 TEXT        NOT NULL CHECK (tier IN ('BASIC','ADVANCED','ALCHEMICAL')),
  status               TEXT        NOT NULL DEFAULT 'AVAILABLE'
                       CHECK (status IN ('AVAILABLE','SOLD','SUSPENDED')),
  price_inr            INTEGER,
  price_chips          INTEGER,
  dna_string           JSONB       NOT NULL,
  block_count          INTEGER     NOT NULL DEFAULT 0,
  version              TEXT        NOT NULL DEFAULT 'v1.0',
  dispute_snapshot_id  UUID,
  reported_count       INTEGER     DEFAULT 0,
  escrow_release_at    TIMESTAMPTZ,
  payout_status        TEXT        DEFAULT 'PENDING'
                       CHECK (payout_status IN ('PENDING','RELEASED','DISPUTED')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sold_at              TIMESTAMPTZ
);
CREATE INDEX idx_vault_available ON public.vault_templates(status) WHERE status = 'AVAILABLE';
CREATE INDEX idx_vault_tier      ON public.vault_templates(tier, status);
CREATE INDEX idx_vault_seller    ON public.vault_templates(seller_id);
ALTER TABLE public.vault_templates ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER vault_templates_set_updated_at BEFORE UPDATE ON public.vault_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "public_can_view_available" ON public.vault_templates FOR SELECT
  USING (status = 'AVAILABLE');
CREATE POLICY "seller_manages_own" ON public.vault_templates FOR ALL
  USING (seller_id = auth.uid());
CREATE POLICY "vault: buyer reads own" ON public.vault_templates FOR SELECT
  USING (buyer_user_id = auth.uid());
CREATE POLICY "vault: service role all" ON public.vault_templates FOR ALL
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.vault_rebirth_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'SOLD' AND OLD.status = 'AVAILABLE' THEN
    INSERT INTO public.agent_task_tickets (created_by, assigned_to, status, mutation_type, zone_type, parent_template_id, blueprint_json)
    VALUES ('DREAMER','ALPHA','OPEN','REBIRTH', NEW.zone_type, NEW.id,
      jsonb_build_object('mutation_type','REBIRTH','parent_template_id',NEW.id,'tier',NEW.tier,'version','v2.0 Evolution'));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER vault_on_sold AFTER UPDATE OF status ON public.vault_templates
  FOR EACH ROW EXECUTE FUNCTION public.vault_rebirth_trigger();


-- ══════════════════════════════════════════════════════════════════════════
-- EXTRA TABLE 19 — export_jobs
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.export_jobs (
  job_id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id    UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  output_format TEXT        NOT NULL CHECK (output_format IN ('STATIC_HTML','NEXTJS','FLUTTER','UNITY')),
  status        TEXT        NOT NULL DEFAULT 'QUEUED'
                CHECK (status IN ('QUEUED','PROCESSING','COMPLETE','FAILED')),
  chip_cost     INTEGER     NOT NULL CHECK (chip_cost BETWEEN 50 AND 300),
  download_url  TEXT,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_export_user   ON public.export_jobs(user_id);
CREATE INDEX idx_export_status ON public.export_jobs(status);
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER export_jobs_set_updated_at BEFORE UPDATE ON public.export_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "export_jobs: user reads own"   ON public.export_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "export_jobs: user inserts own"  ON public.export_jobs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "export_jobs: service role all"  ON public.export_jobs FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- EXTRA TABLE 20 — integrations
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.integrations (
  integration_id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider          TEXT        NOT NULL
                    CHECK (provider IN ('RAZORPAY','WHATSAPP','MAILCHIMP','BREVO','GA4','MIXPANEL')),
  encrypted_token   TEXT        NOT NULL,
  token_iv          TEXT        NOT NULL,
  scope             TEXT,
  connected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_refreshed_at TIMESTAMPTZ,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider)
);
CREATE INDEX idx_integrations_user ON public.integrations(user_id, is_active);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER integrations_set_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "integrations: user reads own"   ON public.integrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "integrations: user inserts own"  ON public.integrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "integrations: user updates own"  ON public.integrations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "integrations: user deletes own"  ON public.integrations FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "integrations: service role all"  ON public.integrations FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- EXTRA TABLE 21 — pixel_events
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.pixel_events (
  event_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  visitor_hash     TEXT        NOT NULL,
  event_type       TEXT        NOT NULL
                   CHECK (event_type IN ('PAGEVIEW','CLICK','SESSION_END','CONVERSION')),
  page_url         TEXT        NOT NULL,
  x_coord          FLOAT,
  y_coord          FLOAT,
  element_selector TEXT,
  session_duration INTEGER,
  referrer         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pixel_project    ON public.pixel_events(project_id);
CREATE INDEX idx_pixel_event_type ON public.pixel_events(project_id, event_type);
CREATE INDEX idx_pixel_created_at ON public.pixel_events(created_at DESC);
ALTER TABLE public.pixel_events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER pixel_events_set_updated_at BEFORE UPDATE ON public.pixel_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "pixel: project owner reads" ON public.pixel_events FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "pixel: service role all"    ON public.pixel_events FOR ALL
  USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- EXTRA TABLE 22 — agent_task_tickets (REPLACED — full ticket schema)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.agent_task_tickets (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by       TEXT        NOT NULL DEFAULT 'DREAMER',
  assigned_to      TEXT        NOT NULL CHECK (assigned_to IN ('ALPHA','BETA','GAMMA')),
  status           TEXT        NOT NULL DEFAULT 'OPEN'
                   CHECK (status IN ('OPEN','IN_PROGRESS','PASSED','FAILED','QUARANTINED')),
  mutation_type    TEXT        NOT NULL CHECK (mutation_type IN ('NEW_BLOCK','REBIRTH','ALCHEMICAL','NICHE_SEED')),
  zone_type        TEXT        CHECK (zone_type IN ('FORGE','FOUNDRY','ENGINE','BAZAAR','LOGIC')),
  block_type       TEXT,
  niche            TEXT,
  parent_template_id UUID      REFERENCES public.vault_templates(id),
  blueprint_json   JSONB       NOT NULL DEFAULT '{}',
  output_code_path TEXT,
  failure_reason   TEXT,
  gamma_iterations INTEGER     DEFAULT 0,
  npm_validation_passed BOOLEAN,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);
CREATE INDEX idx_tickets_assigned ON public.agent_task_tickets(assigned_to, status);
CREATE INDEX idx_tickets_status   ON public.agent_task_tickets(status);
ALTER TABLE public.agent_task_tickets ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER agent_task_tickets_set_updated_at BEFORE UPDATE ON public.agent_task_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "admin_only_tickets" ON public.agent_task_tickets FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "tickets: service role all" ON public.agent_task_tickets FOR ALL
  USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- EXTRA TABLE 23 — game_servers
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.game_servers (
  server_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hetzner_server_id TEXT        NOT NULL,
  ip_address        TEXT,
  status            TEXT        NOT NULL DEFAULT 'STARTING'
                    CHECK (status IN ('STARTING','RUNNING','IDLE','STOPPED')),
  player_count      INTEGER     NOT NULL DEFAULT 0 CHECK (player_count >= 0),
  chips_burned      INTEGER     NOT NULL DEFAULT 0 CHECK (chips_burned >= 0),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stopped_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_game_servers_user    ON public.game_servers(user_id);
CREATE INDEX idx_game_servers_project ON public.game_servers(project_id);
CREATE INDEX idx_game_servers_status  ON public.game_servers(status);
ALTER TABLE public.game_servers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER game_servers_set_updated_at BEFORE UPDATE ON public.game_servers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "game_servers: user reads own"  ON public.game_servers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "game_servers: service role all" ON public.game_servers FOR ALL   USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- EXTRA TABLE 24 — domain_configs
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.domain_configs (
  config_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_domain TEXT        NOT NULL,
  dns_status    TEXT        NOT NULL DEFAULT 'PENDING'
                CHECK (dns_status IN ('PENDING','PROPAGATED','FAILED')),
  a_record_ip   TEXT        NOT NULL DEFAULT '76.76.21.21',
  ssl_status    TEXT        NOT NULL DEFAULT 'PENDING'
                CHECK (ssl_status IN ('PENDING','ACTIVE')),
  verified_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, custom_domain)
);
CREATE INDEX idx_domain_user    ON public.domain_configs(user_id);
CREATE INDEX idx_domain_project ON public.domain_configs(project_id);
ALTER TABLE public.domain_configs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER domain_configs_set_updated_at BEFORE UPDATE ON public.domain_configs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "domains: user reads own"   ON public.domain_configs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "domains: user inserts own"  ON public.domain_configs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "domains: user updates own"  ON public.domain_configs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "domains: user deletes own"  ON public.domain_configs FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "domains: service role all"  ON public.domain_configs FOR ALL    USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- EXTRA TABLE 25 — geo_rules
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.geo_rules (
  rule_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  condition_type  TEXT        NOT NULL CHECK (condition_type IN ('COUNTRY','LANGUAGE')),
  condition_value TEXT        NOT NULL,
  action_type     TEXT        NOT NULL CHECK (action_type IN ('SHOW_PRICE_IN','REDIRECT','SHOW_VARIANT')),
  action_value    TEXT        NOT NULL,
  priority        INTEGER     NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_geo_project ON public.geo_rules(project_id, is_active);
ALTER TABLE public.geo_rules ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER geo_rules_set_updated_at BEFORE UPDATE ON public.geo_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "geo_rules: project owner reads"   ON public.geo_rules FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "geo_rules: project owner inserts" ON public.geo_rules FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "geo_rules: project owner updates" ON public.geo_rules FOR UPDATE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "geo_rules: project owner deletes" ON public.geo_rules FOR DELETE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "geo_rules: service role all"      ON public.geo_rules FOR ALL
  USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- EXTRA TABLE 26 — gso_variants
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.gso_variants (
  variant_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  segment_type    TEXT        NOT NULL
                  CHECK (segment_type IN ('DEVICE','RETURN_VISITOR','REFERRAL_SOURCE','UTM_SOURCE')),
  condition_value TEXT        NOT NULL,
  dna_branch      JSONB       NOT NULL DEFAULT '{}',
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_gso_project ON public.gso_variants(project_id, is_active);
ALTER TABLE public.gso_variants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER gso_variants_set_updated_at BEFORE UPDATE ON public.gso_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "gso: project owner reads"   ON public.gso_variants FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "gso: project owner inserts" ON public.gso_variants FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "gso: project owner updates" ON public.gso_variants FOR UPDATE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "gso: project owner deletes" ON public.gso_variants FOR DELETE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "gso: service role all"      ON public.gso_variants FOR ALL
  USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- RPCs
-- ══════════════════════════════════════════════════════════════════════════

-- Atomically credit/debit chips
CREATE OR REPLACE FUNCTION public.commit_chip_topup(
  p_user_id UUID, p_chip_delta INTEGER
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users_profile SET chip_balance = chip_balance + p_chip_delta WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'User profile not found: %', p_user_id; END IF;
END;
$$;

-- Transition ledger entry between states
CREATE OR REPLACE FUNCTION public.transition_ledger_entry(
  p_entry_id UUID, p_new_status TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_current_status TEXT;
BEGIN
  SELECT status INTO v_current_status FROM public.casino_ledger WHERE id = p_entry_id FOR UPDATE;
  IF v_current_status IS NULL THEN RAISE EXCEPTION 'Ledger entry not found: %', p_entry_id; END IF;
  IF v_current_status = 'PENDING' AND p_new_status IN ('COMMITTED','ROLLEDBACK','FAILED') THEN NULL;
  ELSIF v_current_status = 'ROLLEDBACK' AND p_new_status = 'COMMITTED' THEN NULL;
  ELSE RAISE EXCEPTION 'invalid_ledger_transition' USING DETAIL = format('%s → %s', v_current_status, p_new_status);
  END IF;
  UPDATE public.casino_ledger SET status = p_new_status WHERE id = p_entry_id;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════
-- TABLE 27: project_collaborators (Fix 11 — Team Collaboration)
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.project_collaborators (
  collab_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id          UUID NOT NULL REFERENCES public.users_profile(id),
  invited_user_id   UUID NOT NULL REFERENCES public.users_profile(id),
  role              TEXT NOT NULL CHECK (role IN ('EDITOR','VIEWER')),
  status            TEXT NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','ACCEPTED','REVOKED')),
  invited_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at       TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id, invited_user_id)
);

-- Max 5 collaborators per project (not counting owner)
CREATE OR REPLACE FUNCTION public.enforce_max_collaborators()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.project_collaborators
      WHERE project_id = NEW.project_id
      AND status != 'REVOKED') >= 5 THEN
    RAISE EXCEPTION 'MAX_COLLABORATORS: Project already has 5 collaborators.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_max_collaborators
  BEFORE INSERT ON public.project_collaborators
  FOR EACH ROW EXECUTE FUNCTION public.enforce_max_collaborators();

-- updated_at trigger
CREATE TRIGGER set_project_collaborators_updated_at
  BEFORE UPDATE ON public.project_collaborators
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: collaborators can read projects they are ACCEPTED on
CREATE POLICY "collaborators_can_read_project"
  ON public.projects FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators
      WHERE project_id = projects.id
      AND invited_user_id = auth.uid()
      AND status = 'ACCEPTED'
    )
  );

-- EDITORS can also update DNA (not delete/deploy)
CREATE POLICY "editors_can_update_dna"
  ON public.projects FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators
      WHERE project_id = projects.id
      AND invited_user_id = auth.uid()
      AND role = 'EDITOR'
      AND status = 'ACCEPTED'
    )
  );

-- RLS on project_collaborators table itself
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_manages_collabs"
  ON public.project_collaborators FOR ALL
  USING (owner_id = auth.uid());
CREATE POLICY "invitee_can_see_own_invite"
  ON public.project_collaborators FOR SELECT
  USING (invited_user_id = auth.uid());
CREATE POLICY "invitee_can_accept"
  ON public.project_collaborators FOR UPDATE
  USING (invited_user_id = auth.uid());
CREATE POLICY "collab: service role all"
  ON public.project_collaborators FOR ALL
  USING (auth.role() = 'service_role');


-- ══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Expected: 36 (17 PRD + 10 extras + 9 new)
-- ══════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════════
-- NEW TABLES (Section 1B — 9 missing tables)
-- ════════════════════════════════════════════════════════════════════════════

-- ── TABLE: referrals ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  referred_id     UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  referral_code   TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','CONVERTED','REWARDED')),
  chips_awarded   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  converted_at    TIMESTAMPTZ
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrer_sees_own" ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid());
CREATE POLICY "referrals: service role all" ON public.referrals FOR ALL
  USING (auth.role() = 'service_role');

-- ── TABLE: invoices ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  amount_paise    INTEGER NOT NULL,
  gst_amount_paise INTEGER DEFAULT 0,
  gstin_user      TEXT,
  invoice_number  TEXT NOT NULL UNIQUE,
  invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  pdf_url         TEXT,
  status          TEXT NOT NULL DEFAULT 'ISSUED'
                  CHECK (status IN ('ISSUED','PAID','VOID')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_sees_own_invoices" ON public.invoices FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "invoices: service role all" ON public.invoices FOR ALL
  USING (auth.role() = 'service_role');

-- ── TABLE: infinite_library_assets ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.infinite_library_assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id         UUID REFERENCES public.infinite_library_blocks(block_id) ON DELETE SET NULL,
  asset_type       TEXT NOT NULL CHECK (asset_type IN ('CHARACTER','ENVIRONMENT','WEAPON','VFX','UI','AUDIO','PARTICLE')),
  zone_type        TEXT NOT NULL DEFAULT 'ENGINE',
  species_name     TEXT NOT NULL,
  niche            TEXT,
  sub_niche        TEXT,
  file_path        TEXT NOT NULL,
  file_format      TEXT NOT NULL CHECK (file_format IN ('SDF','GLTF','WGSL','MP3','WAV','JSON')),
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
CREATE POLICY "authenticated_can_read_assets" ON public.infinite_library_assets
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "assets: service role all" ON public.infinite_library_assets FOR ALL
  USING (auth.role() = 'service_role');

-- ── TABLE: game_saves ───────────────────────────────────────────
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
CREATE POLICY "game_owner_reads_saves" ON public.game_saves FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects WHERE id = game_id AND user_id = auth.uid()
  ));
CREATE POLICY "game_saves: service role all" ON public.game_saves FOR ALL
  USING (auth.role() = 'service_role');

-- ── TABLE: questionnaire_niche_map ──────────────────────────────
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
CREATE POLICY "public_read_niche_map" ON public.questionnaire_niche_map
  FOR SELECT USING (true);
CREATE POLICY "niche_map: service role all" ON public.questionnaire_niche_map FOR ALL
  USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 1C — Add missing columns to existing tables
-- ════════════════════════════════════════════════════════════════════════════

-- profiles: add all new fields needed
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS
  referral_code       TEXT UNIQUE DEFAULT gen_random_uuid()::text;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS
  referred_by         UUID REFERENCES public.users_profile(id);
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS
  onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS
  interface_language  TEXT DEFAULT 'en'
                      CHECK (interface_language IN ('en','hi','ta','te','mr','bn'));
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS
  gstin               TEXT;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS
  rollover_chips      INTEGER DEFAULT 0;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS
  consent_version     TEXT DEFAULT 'v1.0';
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS
  trial_started_at    TIMESTAMPTZ;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS
  trial_ends_at       TIMESTAMPTZ;

-- projects: add multi-page, conflict resolution, block versioning
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  is_multi_page       BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  pages               JSONB DEFAULT '[]';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  version_vector      INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  niche               TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  sub_niche           TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  dir                 TEXT DEFAULT 'ltr' CHECK (dir IN ('ltr','rtl'));
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  sandbox_mode        BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  preview_url         TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  custom_domain       TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  domain_verified     BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS
  built_with_badge    BOOLEAN DEFAULT true;

-- infinite_library_blocks: add block versioning + niche
ALTER TABLE public.infinite_library_blocks ADD COLUMN IF NOT EXISTS
  block_version       TEXT NOT NULL DEFAULT 'v1.0';
ALTER TABLE public.infinite_library_blocks ADD COLUMN IF NOT EXISTS
  niche               TEXT;
ALTER TABLE public.infinite_library_blocks ADD COLUMN IF NOT EXISTS
  sub_niche           TEXT;
ALTER TABLE public.infinite_library_blocks ADD COLUMN IF NOT EXISTS
  is_niche_specific   BOOLEAN DEFAULT false;

-- dna_mutations: add conflict resolution
ALTER TABLE public.dna_mutations ADD COLUMN IF NOT EXISTS
  version_vector      INTEGER DEFAULT 0;
ALTER TABLE public.dna_mutations ADD COLUMN IF NOT EXISTS
  conflict_detected   BOOLEAN DEFAULT false;

-- consent_records: add versioning
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS
  consent_version     TEXT NOT NULL DEFAULT 'v1.0';
ALTER TABLE public.consent_records ADD COLUMN IF NOT EXISTS
  reconsented_at      TIMESTAMPTZ;


-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 1D — Session timeout tracking in Redis
-- (No SQL needed — handled via Redis key in Section 3)
-- Key: session:last_active:{user_id}  TTL: 28800s (8 hours)
-- Written by: every authenticated API route via middleware
-- Read by: middleware.ts before processing any request
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 1E — Multi-page DNA structure contract
-- projects.pages JSONB format:
-- [
--   {
--     "id": "uuid",
--     "slug": "about",
--     "title": "About Us",
--     "is_home": false,
--     "genome": [ ...DNABlock[] ]
--   }
-- ]
-- When is_multi_page=true, DNA Interpreter reads pages[]
-- When is_multi_page=false, DNA Interpreter reads dna_string.genome directly
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 1F — Cron timezone in DNA
-- cron_pulse block props MUST include:
-- { schedule: string, timezone: string (IANA), test_mode: boolean }
-- Example: { schedule: "0 9 * * *", timezone: "Asia/Kolkata", test_mode: false }
-- ════════════════════════════════════════════════════════════════════════════
