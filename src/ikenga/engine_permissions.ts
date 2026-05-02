// ============================================================
// IKENGA ENGINE PERMISSIONS
// Defines which tiers and AI models may access each engine,
// and whether actions require governance approval.
// ============================================================

import type { EngineId, EnginePermission } from "./engine_types";

// ------------------------------------------------------------------
// Permission map — one entry per engine.
// ------------------------------------------------------------------

export const ENGINE_PERMISSIONS: Record<EngineId, EnginePermission> = {
  "emotional-os": {
    engineId: "emotional-os",
    allowedTiers: ["os", "ministry"],
    allowedAIModels: ["claude", "ikenga"],
    readOnly: false,
    requiresApproval: false,
  },

  "core-operations": {
    engineId: "core-operations",
    allowedTiers: ["os", "ministry"],
    allowedAIModels: ["claude", "gpt", "ikenga"],
    readOnly: false,
    requiresApproval: true,
  },

  "evidence-vault": {
    engineId: "evidence-vault",
    allowedTiers: ["os", "ministry"],
    allowedAIModels: ["claude", "ikenga"],
    readOnly: true,   // vault is append-only; no mutation without approval
    requiresApproval: true,
  },

  "trust-identity": {
    engineId: "trust-identity",
    allowedTiers: ["os"],
    allowedAIModels: ["claude", "ikenga"],
    readOnly: false,
    requiresApproval: true,
  },

  marketplace: {
    engineId: "marketplace",
    allowedTiers: ["os", "ministry", "cooperative", "public"],
    allowedAIModels: ["claude", "gpt", "gemini", "ikenga"],
    readOnly: false,
    requiresApproval: false,
  },

  "circular-intelligence": {
    engineId: "circular-intelligence",
    allowedTiers: ["os", "ministry", "cooperative"],
    allowedAIModels: ["claude", "gpt", "gemini", "ikenga"],
    readOnly: false,
    requiresApproval: false,
  },

  "financial-banking": {
    engineId: "financial-banking",
    allowedTiers: ["os", "ministry"],
    allowedAIModels: ["claude", "ikenga"],
    readOnly: false,
    requiresApproval: true,
  },

  "government-workflows": {
    engineId: "government-workflows",
    allowedTiers: ["os", "ministry"],
    allowedAIModels: ["claude", "ikenga"],
    readOnly: false,
    requiresApproval: true,
  },
};

// ------------------------------------------------------------------
// Permission helpers
// ------------------------------------------------------------------

import type { AccessTier, AIModel } from "./engine_types";

/** Check whether a given access tier may call an engine. */
export function canTierAccess(engineId: EngineId, tier: AccessTier): boolean {
  return ENGINE_PERMISSIONS[engineId]?.allowedTiers.includes(tier) ?? false;
}

/** Check whether a given AI model may invoke an engine. */
export function canAIAccess(engineId: EngineId, model: AIModel): boolean {
  return ENGINE_PERMISSIONS[engineId]?.allowedAIModels.includes(model) ?? false;
}

/** Return true if the engine requires governance approval before acting. */
export function requiresApproval(engineId: EngineId): boolean {
  return ENGINE_PERMISSIONS[engineId]?.requiresApproval ?? true;
}
