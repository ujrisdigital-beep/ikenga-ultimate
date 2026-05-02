-- ============================================================
-- IKENGA PAYMENTS & TIER SYSTEM
-- Run this in your Supabase SQL editor.
-- ============================================================

-- User profiles — created on first login, linked to waitlist email
CREATE TABLE IF NOT EXISTS user_profiles (
  email         TEXT PRIMARY KEY,
  display_name  TEXT,
  tier          TEXT NOT NULL DEFAULT 'free',     -- 'free' | 'pro'
  pro_type      TEXT,                              -- 'monthly' | 'lifetime'
  pro_expires   TIMESTAMPTZ,                       -- null means lifetime
  gens_used     INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment requests — one per payment attempt
CREATE TABLE IF NOT EXISTS payment_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  unique_ref    TEXT NOT NULL UNIQUE,              -- IKG-XXXXXX format
  tier_type     TEXT NOT NULL,                     -- 'monthly' | 'lifetime'
  amount_gbp    NUMERIC(8,2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'rejected'
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at  TIMESTAMPTZ
);

-- Generation log — one row per successful generation
CREATE TABLE IF NOT EXISTS generation_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  label       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs  ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS — no policies needed for server-side use
