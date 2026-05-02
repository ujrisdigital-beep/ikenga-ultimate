-- ============================================================
-- IKENGA UNIFIED PLATFORM SCHEMA
-- Run this in Supabase SQL editor AFTER payments_schema.sql
-- ============================================================

-- Add new columns to user_profiles (idempotent)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS streak_days  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active  DATE,
  ADD COLUMN IF NOT EXISTS bonus_gens   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_product TEXT NOT NULL DEFAULT 'IKENGA';

-- Add product column to generation_logs
ALTER TABLE generation_logs
  ADD COLUMN IF NOT EXISTS product TEXT NOT NULL DEFAULT 'IKENGA';

-- ── Onboarding progress ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_progress (
  email          TEXT PRIMARY KEY,
  current_step   INTEGER NOT NULL DEFAULT 1,       -- 1-7
  completed_days JSONB   NOT NULL DEFAULT '{}',    -- {"1":"2026-04-09T...",...}
  referral_code  TEXT    UNIQUE,
  referred_by    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Content items (individual pieces from a generation) ──────
CREATE TABLE IF NOT EXISTS content_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  product       TEXT NOT NULL DEFAULT 'IKENGA',
  content_type  TEXT NOT NULL, -- 'social_post'|'video_script'|'email'|'ad'|'carousel'
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  platform      TEXT,          -- 'Instagram'|'LinkedIn'|'X'|etc
  day           INTEGER,       -- which day in the 7-day plan
  metadata      JSONB NOT NULL DEFAULT '{}',
  quality       TEXT NOT NULL DEFAULT 'B', -- A/B/C/D
  published     BOOLEAN NOT NULL DEFAULT false,
  copied        BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Content feedback (thumbs up/down) ───────────────────────
CREATE TABLE IF NOT EXISTS content_feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  item_id    UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  product    TEXT NOT NULL,
  signal     TEXT NOT NULL CHECK (signal IN ('up','down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email, item_id)
);

-- ── User events (behavior tracking) ─────────────────────────
CREATE TABLE IF NOT EXISTS user_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT,
  event      TEXT NOT NULL,  -- 'page_view'|'product_switch'|'generate'|'copy'|'feedback'|'signup'
  product    TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Referral codes ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_codes (
  code       TEXT PRIMARY KEY,
  owner      TEXT NOT NULL UNIQUE, -- email of the owner
  uses       INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_feedback    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes      ENABLE ROW LEVEL SECURITY;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_content_items_email   ON content_items(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_product ON content_items(product, content_type);
CREATE INDEX IF NOT EXISTS idx_user_events_email     ON user_events(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_events_event     ON user_events(event, created_at DESC);
