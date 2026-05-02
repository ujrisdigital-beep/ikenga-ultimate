// ============================================================
// IKENGA ORCHESTRATION - PIPELINE TYPES
// Phase 2 contracts for multi-AI orchestration, logging, and
// placeholder execution state. This file stays framework-agnostic
// so it can be reused by jobs, API routes, and admin tooling.
// ============================================================

import type { EngineId, SemVer } from "../engine_types";
import type { AgentId, SupportedAgentModel } from "./agents";

// ------------------------------------------------------------------
// Pipeline lifecycle state.
// ------------------------------------------------------------------

export type PipelineStatus = "pending" | "running" | "completed" | "failed";

// ------------------------------------------------------------------
// Individual step lifecycle state.
// ------------------------------------------------------------------

export type PipelineStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

// ------------------------------------------------------------------
// Basic step kinds.
// `agent` executes a model.
// `merge` combines earlier outputs with placeholder logic.
// ------------------------------------------------------------------

export type PipelineStepKind = "agent" | "merge";

// ------------------------------------------------------------------
// Logging hooks let callers plug in console logging, structured logs,
// or audit sinks without changing pipeline internals.
// ------------------------------------------------------------------

export type PipelineLogLevel = "debug" | "info" | "warn" | "error";

export interface PipelineLogEvent {
  level: PipelineLogLevel;
  message: string;
  runId: string;
  pipelineId: string;
  stepId?: string;
  engineId?: EngineId;
  timestamp: string;
  details?: Record<string, unknown>;
}

export type PipelineLogger = (event: PipelineLogEvent) => void | Promise<void>;

// ------------------------------------------------------------------
// Input shape for kicking off a run.
// ------------------------------------------------------------------

export interface PipelineInput {
  engineId: EngineId;
  prompt: string;
  initiatedBy: string;
  context?: Record<string, unknown>;
  runId?: string;
  logger?: PipelineLogger;
}

// ------------------------------------------------------------------
// Step definition shared by the registry and runtime.
// ------------------------------------------------------------------

export interface PipelineStepDefinition {
  id: string;
  name: string;
  description: string;
  kind: PipelineStepKind;
  agentId?: AgentId;
  dependsOn?: string[];
  optional?: boolean;
  timeoutMs?: number;
}

// ------------------------------------------------------------------
// Canonical pipeline definition persisted or seeded into storage.
// ------------------------------------------------------------------

export interface PipelineDefinition {
  id: string;
  name: string;
  description: string;
  version: SemVer;
  status: "active" | "inactive";
  steps: PipelineStepDefinition[];
}

// ------------------------------------------------------------------
// Output from a single step.
// This keeps compatibility with the earlier StageOutput naming.
// ------------------------------------------------------------------

export interface StageOutput {
  stepId: string;
  role: string;
  model: SupportedAgentModel | "merge";
  output: string;
  tokensUsed: number;
  durationMs: number;
  completedAt: string;
  status: PipelineStepStatus;
  error?: string;
}

// ------------------------------------------------------------------
// Full pipeline result returned to the caller.
// ------------------------------------------------------------------

export interface PipelineResult {
  runId: string;
  pipelineId: string;
  engineId: EngineId;
  initiatedBy: string;
  stages: StageOutput[];
  synthesis: string;
  version: SemVer;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  success: boolean;
  error?: string;
}

// ------------------------------------------------------------------
// Runtime tracking record for async job orchestration.
// ------------------------------------------------------------------

export interface PipelineRunRecord {
  runId: string;
  pipelineId: string;
  engineId: EngineId;
  initiatedBy: string;
  status: PipelineStatus;
  createdAt: string;
  completedAt?: string;
  result?: PipelineResult;
}

// ------------------------------------------------------------------
// Default logger hook.
// Callers may replace this with audit or telemetry sinks later.
// ------------------------------------------------------------------

export const consolePipelineLogger: PipelineLogger = (event) => {
  const payload = {
    level: event.level,
    message: event.message,
    runId: event.runId,
    pipelineId: event.pipelineId,
    stepId: event.stepId,
    engineId: event.engineId,
    timestamp: event.timestamp,
    details: event.details,
  };

  console.log(JSON.stringify(payload));
};

// ------------------------------------------------------------------
// Phase 2 default pipeline definition.
// This demonstrates Claude + GPT working together with a final merge.
// ------------------------------------------------------------------

export const DEFAULT_PIPELINE: PipelineDefinition = {
  id: "phase-2-multi-ai",
  name: "Phase 2 Multi-AI Orchestration",
  description:
    "Runs a Claude drafting pass, a GPT review pass, and a placeholder merge stage.",
  version: "1.0.0",
  status: "active",
  steps: [
    {
      id: "claude-draft",
      name: "Claude Draft",
      description: "Creates the first structured response from the user prompt.",
      kind: "agent",
      agentId: "claude-primary",
      timeoutMs: 15000,
    },
    {
      id: "gpt-review",
      name: "GPT Review",
      description: "Reviews the Claude draft and adds a second perspective.",
      kind: "agent",
      agentId: "gpt-reviewer",
      dependsOn: ["claude-draft"],
      optional: true,
      timeoutMs: 15000,
    },
    {
      id: "merge-output",
      name: "Merge Output",
      description: "Combines both model outputs into one placeholder synthesis.",
      kind: "merge",
      dependsOn: ["claude-draft"],
      timeoutMs: 5000,
    },
  ],
};
