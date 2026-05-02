-- ============================================================
-- IKENGA PHASE 1 ENGINE REGISTRY SCHEMA
-- Run this in the Supabase SQL editor before calling registerAllEngines().
-- This file intentionally focuses only on the `engines` table requested
-- for Phase 1 and keeps the schema colocated with the registry code.
-- ============================================================

-- ------------------------------------------------------------------
-- engines
-- Stores the canonical registry row for each engine. The app code seeds
-- the eight default entries defined in engineRegistry.ts.
-- ------------------------------------------------------------------
create table if not exists public.engines (
  id                  text primary key,
  name                text not null,
  path                text not null unique,
  description         text not null,
  category            text not null,
  status              text not null default 'active',
  api_key_env_var     text not null,
  api_key_placeholder text not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Basic lifecycle guardrails for the current registry contract.
  constraint engines_status_check
    check (status in ('active', 'inactive', 'maintenance')),
  constraint engines_category_check
    check (
      category in (
        'operating-system',
        'operations',
        'evidence',
        'identity',
        'commerce',
        'intelligence',
        'finance',
        'government'
      )
    )
);

-- ------------------------------------------------------------------
-- Helpful indexes for admin lookups and future dashboard filtering.
-- ------------------------------------------------------------------
create index if not exists engines_category_idx on public.engines (category);
create index if not exists engines_status_idx on public.engines (status);

-- ------------------------------------------------------------------
-- Phase 1 keeps RLS enabled so future policies can be added without
-- changing the table definition. Service-role writes will still work.
-- ------------------------------------------------------------------
alter table public.engines enable row level security;
