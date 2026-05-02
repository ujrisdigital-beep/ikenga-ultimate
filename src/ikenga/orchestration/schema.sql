-- ============================================================
-- IKENGA PHASE 2 ORCHESTRATION SCHEMA
-- Run this in the Supabase SQL editor before persisting orchestration
-- metadata and execution history. This file focuses on pipelines,
-- pipeline_runs, and pipeline_steps only.
-- ============================================================

-- ------------------------------------------------------------------
-- pipelines
-- Stores the canonical definition for each orchestration pipeline.
-- `definition` keeps the step graph as JSON so the TypeScript runtime
-- and Supabase record can stay in sync without a rigid per-step schema.
-- ------------------------------------------------------------------
create table if not exists public.pipelines (
  id          text primary key,
  name        text not null,
  description text not null,
  version     text not null,
  status      text not null default 'active',
  definition  jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint pipelines_status_check
    check (status in ('active', 'inactive'))
);

create index if not exists pipelines_status_idx on public.pipelines (status);

-- ------------------------------------------------------------------
-- pipeline_runs
-- Captures each execution attempt for a pipeline against an engine.
-- This table is the top-level audit row for runtime status, inputs,
-- outputs, and overall duration.
-- ------------------------------------------------------------------
create table if not exists public.pipeline_runs (
  id            uuid primary key default gen_random_uuid(),
  pipeline_id   text not null references public.pipelines(id) on delete cascade,
  engine_id     text not null references public.engines(id) on delete restrict,
  initiated_by  text not null,
  status        text not null default 'pending',
  input_prompt  text not null,
  input_context jsonb,
  final_output  text,
  error_message text,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  duration_ms   integer,
  created_at    timestamptz not null default now(),

  constraint pipeline_runs_status_check
    check (status in ('pending', 'running', 'completed', 'failed'))
);

create index if not exists pipeline_runs_pipeline_id_idx
  on public.pipeline_runs (pipeline_id);
create index if not exists pipeline_runs_engine_id_idx
  on public.pipeline_runs (engine_id);
create index if not exists pipeline_runs_status_idx
  on public.pipeline_runs (status);

-- ------------------------------------------------------------------
-- pipeline_steps
-- Persists the outcome of each step inside a pipeline run, including
-- provider, prompt snapshot, output text, and timing metadata.
-- This enables detailed replay, debugging, and analytics later on.
-- ------------------------------------------------------------------
create table if not exists public.pipeline_steps (
  id              uuid primary key default gen_random_uuid(),
  pipeline_run_id uuid not null references public.pipeline_runs(id) on delete cascade,
  step_id         text not null,
  step_name       text not null,
  provider        text not null,
  agent_id        text,
  status          text not null default 'pending',
  sequence_no     integer not null,
  prompt_snapshot text,
  output_text     text,
  error_message   text,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  duration_ms     integer,
  created_at      timestamptz not null default now(),

  constraint pipeline_steps_status_check
    check (status in ('pending', 'running', 'completed', 'failed', 'skipped'))
);

create index if not exists pipeline_steps_run_id_idx
  on public.pipeline_steps (pipeline_run_id);
create index if not exists pipeline_steps_status_idx
  on public.pipeline_steps (status);
create index if not exists pipeline_steps_sequence_idx
  on public.pipeline_steps (pipeline_run_id, sequence_no);

alter table public.pipelines enable row level security;
alter table public.pipeline_runs enable row level security;
alter table public.pipeline_steps enable row level security;
