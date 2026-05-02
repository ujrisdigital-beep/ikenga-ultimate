-- ============================================================
-- IKENGA PHASE 3 CONTENT INTELLIGENCE SCHEMA
-- Run this in the Supabase SQL editor before persisting content
-- engine records. This schema is scoped to content generation,
-- scoring, feedback, and scheduling for Phase 3.
-- ============================================================

-- ------------------------------------------------------------------
-- content_items
-- Stores generated content drafts and their main metadata. Each row
-- represents a single content artifact created by Claude, GPT, or
-- hybrid mode.
-- ------------------------------------------------------------------
create table if not exists public.content_items (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  topic        text not null,
  objective    text not null,
  audience     text not null,
  type         text not null,
  model        text not null,
  status       text not null default 'draft',
  content      text not null,
  summary      text not null,
  tags         jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint content_items_model_check
    check (model in ('claude', 'gpt', 'hybrid'))
);

create index if not exists content_items_model_idx on public.content_items (model);
create index if not exists content_items_type_idx on public.content_items (type);

-- ------------------------------------------------------------------
-- content_scores
-- Stores evaluation results for content items, including the overall
-- score and a JSON breakdown of metric-level placeholder scores.
-- ------------------------------------------------------------------
create table if not exists public.content_scores (
  id            uuid primary key default gen_random_uuid(),
  content_id    uuid not null references public.content_items(id) on delete cascade,
  model         text not null,
  overall_score integer not null,
  metrics       jsonb not null,
  recommendation text not null,
  created_at    timestamptz not null default now(),

  constraint content_scores_model_check
    check (model in ('claude', 'gpt', 'hybrid'))
);

create index if not exists content_scores_content_id_idx
  on public.content_scores (content_id);

-- ------------------------------------------------------------------
-- content_feedback
-- Captures reviewer feedback on generated content. This allows teams
-- to keep human review alongside model-generated drafts and scores.
-- ------------------------------------------------------------------
create table if not exists public.content_feedback (
  id                uuid primary key default gen_random_uuid(),
  content_id        uuid not null references public.content_items(id) on delete cascade,
  reviewer          text not null,
  model             text not null,
  sentiment         text not null,
  comments          text not null,
  suggested_actions jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now(),

  constraint content_feedback_model_check
    check (model in ('claude', 'gpt', 'hybrid')),
  constraint content_feedback_sentiment_check
    check (sentiment in ('positive', 'neutral', 'negative'))
);

create index if not exists content_feedback_content_id_idx
  on public.content_feedback (content_id);

-- ------------------------------------------------------------------
-- content_schedule
-- Stores calendar-ready scheduling rows for campaign planning. Each row
-- maps a content item or planned title to a publication channel and date.
-- ------------------------------------------------------------------
create table if not exists public.content_schedule (
  id             uuid primary key default gen_random_uuid(),
  content_id     uuid references public.content_items(id) on delete set null,
  campaign_name  text not null,
  title          text not null,
  topic          text not null,
  channel        text not null,
  scheduled_for  timestamptz not null,
  model          text not null,
  status         text not null default 'planned',
  rationale      text not null,
  created_at     timestamptz not null default now(),

  constraint content_schedule_model_check
    check (model in ('claude', 'gpt', 'hybrid'))
);

create index if not exists content_schedule_channel_idx
  on public.content_schedule (channel);
create index if not exists content_schedule_scheduled_for_idx
  on public.content_schedule (scheduled_for);

alter table public.content_items enable row level security;
alter table public.content_scores enable row level security;
alter table public.content_feedback enable row level security;
alter table public.content_schedule enable row level security;
