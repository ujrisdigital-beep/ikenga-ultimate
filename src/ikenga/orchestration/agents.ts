// ============================================================
// IKENGA ORCHESTRATION - AGENT REGISTRY
// Phase 2 agent definitions for the orchestration pipeline.
// This version intentionally supports Claude and GPT only,
// using placeholder configuration until live execution logic
// is connected to the real SDK calls.
// ============================================================

import type { AIModel } from "../engine_types";

// ------------------------------------------------------------------
// Supported providers for Phase 2.
// Narrowing this union keeps the pipeline aligned with the user's brief.
// ------------------------------------------------------------------

export type SupportedAgentModel = Extract<AIModel, "claude" | "gpt">;

// ------------------------------------------------------------------
// Stable agent identifiers referenced by pipeline steps.
// ------------------------------------------------------------------

export type AgentId = "claude-primary" | "gpt-reviewer";

// ------------------------------------------------------------------
// Registry row for a runnable agent.
// ------------------------------------------------------------------

export interface AgentConfig {
  id: AgentId;
  role: string;
  model: SupportedAgentModel;
  label: string;
  description: string;
  apiKeyEnvVar: string;
  apiKeyPlaceholder: string;
  maxTokens: number;
  temperature: number;
}

// ------------------------------------------------------------------
// Agent registry with placeholder API metadata.
// Real SDK clients can resolve the env var later without changing
// the orchestration contract.
// ------------------------------------------------------------------

export const AGENTS: Record<AgentId, AgentConfig> = {
  "claude-primary": {
    id: "claude-primary",
    role: "draft",
    model: "claude",
    label: "Claude Primary",
    description: "Generates the primary draft and initial strategic framing.",
    apiKeyEnvVar: "ANTHROPIC_API_KEY",
    apiKeyPlaceholder: "PLACEHOLDER_ANTHROPIC_API_KEY",
    maxTokens: 2048,
    temperature: 0.6,
  },
  "gpt-reviewer": {
    id: "gpt-reviewer",
    role: "review",
    model: "gpt",
    label: "GPT Reviewer",
    description: "Reviews and expands on the Claude draft with a second opinion.",
    apiKeyEnvVar: "OPENAI_API_KEY",
    apiKeyPlaceholder: "PLACEHOLDER_OPENAI_API_KEY",
    maxTokens: 2048,
    temperature: 0.4,
  },
};

/**
 * Return all supported Phase 2 agents in a predictable order.
 */
export function getPipelineAgents(): AgentConfig[] {
  return [AGENTS["claude-primary"], AGENTS["gpt-reviewer"]];
}

/**
 * Resolve one agent by id.
 */
export function getAgentById(agentId: AgentId): AgentConfig {
  return AGENTS[agentId];
}
