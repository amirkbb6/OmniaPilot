-- ============================================================
-- OmniaPilot — Supabase Schema
-- Orchestrateur Karim Benali / Purity Agency
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE : leads
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  company       TEXT,
  source        TEXT,
  score         INTEGER     NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  status        TEXT        NOT NULL DEFAULT 'new'
                            CHECK (status IN ('new','contacted','qualified','negotiation','signed','lost')),
  assigned_to   TEXT,
  notes         TEXT,
  metadata      JSONB       NOT NULL DEFAULT '{}'
);

-- ============================================================
-- TABLE : projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_id       UUID        REFERENCES leads(id) ON DELETE SET NULL,
  name          TEXT        NOT NULL,
  description   TEXT,
  status        TEXT        NOT NULL DEFAULT 'new'
                            CHECK (status IN (
                              'new',
                              'brief_started',
                              'brief_completed',
                              'blueprint_in_progress',
                              'blueprint_approved',
                              'copy_design_in_progress',
                              'copy_design_done',
                              'preview_ready',
                              'delivered',
                              'archived'
                            )),
  budget        DECIMAL(12,2),
  deadline      DATE,
  metadata      JSONB       NOT NULL DEFAULT '{}'
);

-- ============================================================
-- TABLE : invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project_id          UUID        REFERENCES projects(id) ON DELETE SET NULL,
  amount              DECIMAL(12,2) NOT NULL,
  status              TEXT        NOT NULL DEFAULT 'draft'
                                  CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  due_date            DATE,
  paid_at             TIMESTAMPTZ,
  stripe_payment_id   TEXT,
  metadata            JSONB       NOT NULL DEFAULT '{}'
);

-- ============================================================
-- TABLE : agent_logs  (APPEND-ONLY — jamais UPDATE ni DELETE)
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_logs (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  agent_id      TEXT        NOT NULL,
  action        TEXT        NOT NULL,
  input         JSONB,
  output        JSONB,
  tier          INTEGER     NOT NULL DEFAULT 1 CHECK (tier IN (1, 2, 3)),
  duration_ms   INTEGER,
  status        TEXT        NOT NULL DEFAULT 'success'
                            CHECK (status IN ('success','error','pending')),
  error_message TEXT
);

-- Trigger qui interdit toute modification sur agent_logs
CREATE OR REPLACE FUNCTION fn_prevent_agent_logs_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION
    'agent_logs est APPEND-ONLY : UPDATE et DELETE sont interdits (ligne id=%).',
    OLD.id;
END;
$$;

CREATE TRIGGER trg_agent_logs_append_only
  BEFORE UPDATE OR DELETE ON agent_logs
  FOR EACH ROW
  EXECUTE FUNCTION fn_prevent_agent_logs_mutation();

-- ============================================================
-- TABLE : escalations  (Tier 3)
-- ============================================================
CREATE TABLE IF NOT EXISTS escalations (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  agent_id      TEXT        NOT NULL,
  action        TEXT        NOT NULL,
  description   TEXT        NOT NULL,
  context       TEXT,
  content       TEXT,
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected','expired')),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  resolved_at   TIMESTAMPTZ,
  resolved_by   TEXT
);

-- ============================================================
-- FONCTION updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_leads_score       ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_status      ON leads(status);
CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status   ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent  ON agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_ts     ON agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_exp   ON escalations(expires_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations  ENABLE ROW LEVEL SECURITY;

-- Service role : accès complet (backend n8n)
CREATE POLICY "service_role_leads"       ON leads       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_projects"    ON projects    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_invoices"    ON invoices    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_agent_logs" ON agent_logs  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_escalations" ON escalations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- SUPABASE DATABASE WEBHOOKS (à configurer dans le dashboard)
-- Déclencher sur : leads (INSERT, UPDATE), projects (UPDATE),
--                  invoices (UPDATE)
-- URL cible : {{ N8N_WEBHOOK_BASE_URL }}/webhook/supabase-events
-- ============================================================
