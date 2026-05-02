-- ============================================================
-- IKENGA PHASE 7 SUPABASE SCHEMA
-- Backend foundation for engine registration, versioning, prompt
-- governance, deployments, and immutable audit history.
-- ============================================================

-- ------------------------------------------------------------------
-- engines
-- Canonical engine registry rows seeded from src/ikenga/engines.
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

create index if not exists engines_category_idx on public.engines (category);
create index if not exists engines_status_idx on public.engines (status);

-- ------------------------------------------------------------------
-- engine_versions
-- Version history for engines. The registry row stays lightweight
-- while releases are tracked here as immutable semver records.
-- ------------------------------------------------------------------
create table if not exists public.engine_versions (
  id             uuid primary key default gen_random_uuid(),
  engine_id      text not null references public.engines(id) on delete cascade,
  version        text not null,
  changelog      text not null,
  deployed_at    timestamptz not null default now(),
  deployed_by    text not null,
  parent_version text,
  created_at     timestamptz not null default now()
);

create unique index if not exists engine_versions_engine_version_idx
  on public.engine_versions (engine_id, version);
create index if not exists engine_versions_engine_id_idx
  on public.engine_versions (engine_id);

-- ------------------------------------------------------------------
-- engine_prompts
-- Governance-controlled prompt history for each engine. Prompts are
-- versioned, lineage-aware, and approval driven.
-- ------------------------------------------------------------------
create table if not exists public.engine_prompts (
  prompt_id        uuid primary key default gen_random_uuid(),
  engine_id        text not null references public.engines(id) on delete cascade,
  version          text not null,
  content          text not null,
  status           text not null default 'draft',
  change_note      text not null,
  created_by       text not null,
  approved_by      text,
  approved_at      timestamptz,
  parent_prompt_id uuid references public.engine_prompts(prompt_id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint engine_prompts_status_check
    check (status in ('draft', 'pending-approval', 'approved', 'rejected', 'deprecated'))
);

create index if not exists engine_prompts_engine_id_idx
  on public.engine_prompts (engine_id);
create index if not exists engine_prompts_status_idx
  on public.engine_prompts (status);

-- ------------------------------------------------------------------
-- engine_deployments
-- Deployment governance history, including approval state, Vercel hook
-- metadata, rollback targets, and deployment errors.
-- ------------------------------------------------------------------
create table if not exists public.engine_deployments (
  id                   uuid primary key,
  engine_id            text not null references public.engines(id) on delete cascade,
  version              text not null,
  environment          text not null,
  status               text not null default 'requested',
  requested_by         text not null,
  requested_at         timestamptz not null default now(),
  approval_request_id  text,
  approved_by          text,
  approved_at          timestamptz,
  deployed_at          timestamptz,
  deployed_by          text,
  rollback_target_id   uuid references public.engine_deployments(id),
  vercel_deployment_id text,
  deployment_url       text,
  error_message        text,
  created_at           timestamptz not null default now(),

  constraint engine_deployments_environment_check
    check (environment in ('development', 'staging', 'production')),
  constraint engine_deployments_status_check
    check (
      status in (
        'requested',
        'pending-approval',
        'approved',
        'deploying',
        'deployed',
        'failed',
        'rolled-back'
      )
    )
);

create index if not exists engine_deployments_engine_id_idx
  on public.engine_deployments (engine_id);
create index if not exists engine_deployments_status_idx
  on public.engine_deployments (status);

-- ------------------------------------------------------------------
-- engine_audit_logs
-- Immutable audit history with chained entry hashes, payload hashes,
-- actor role metadata, and scope-aware filtering support.
-- ------------------------------------------------------------------
create table if not exists public.engine_audit_logs (
  audit_id            uuid primary key,
  action              text not null,
  category            text not null,
  scope               text not null,
  scope_id            text,
  actor               text not null,
  actor_role          text not null,
  actor_tier          text not null,
  engine_id           text references public.engines(id) on delete set null,
  target_id           text,
  ai_model            text,
  agent_id            text,
  outcome             text not null,
  payload             jsonb,
  payload_hash        text,
  output_hash         text,
  previous_entry_hash text,
  entry_hash          text not null unique,
  ip_address          text,
  session_id          text,
  timestamp           timestamptz not null default now(),

  constraint engine_audit_logs_outcome_check
    check (outcome in ('success', 'failure', 'warning'))
);

create index if not exists audit_logs_engine_id_idx
  on public.engine_audit_logs (engine_id);
create index if not exists audit_logs_actor_idx
  on public.engine_audit_logs (actor);
create index if not exists audit_logs_category_idx
  on public.engine_audit_logs (category);
create index if not exists audit_logs_scope_idx
  on public.engine_audit_logs (scope, scope_id);
create index if not exists audit_logs_timestamp_idx
  on public.engine_audit_logs (timestamp desc);

alter table public.engines enable row level security;
alter table public.engine_versions enable row level security;
alter table public.engine_prompts enable row level security;
alter table public.engine_deployments enable row level security;
alter table public.engine_audit_logs enable row level security;

-- ------------------------------------------------------------------
-- waitlist_signups
-- Public landing-page signup capture for launch and early-access intake.
-- ------------------------------------------------------------------
create table if not exists public.waitlist_signups (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text not null default 'landing-page',
  status     text not null default 'pending',
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  constraint waitlist_signups_status_check
    check (status in ('pending', 'invited', 'activated'))
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;
