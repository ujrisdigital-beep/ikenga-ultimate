// ============================================================
// IKENGA ACCESS - POLICIES
// Phase 6 sovereign policy matrix describing which tiers, roles,
// and AI models may perform which operations on each engine.
// Deny rules override allow rules.
// ============================================================

import type { RoleId } from "./roles";
import type { AccessTier, AIModel, EngineId } from "../engine_types";

// ------------------------------------------------------------------
// Operations governed by the sovereignty layer.
// ------------------------------------------------------------------

export type AccessOperation =
  | "read"
  | "write"
  | "deploy"
  | "approve"
  | "manage-prompts"
  | "write-audit"
  | "ai-invoke";

export interface PolicyCondition {
  field: "environment" | "requiresApproval" | "readOnly";
  operator: "eq" | "neq" | "in" | "not-in";
  value: string | boolean | Array<string | boolean>;
}

export interface PolicyRule {
  policyId: string;
  engineId: EngineId;
  label: string;
  operation: AccessOperation;
  effect: "allow" | "deny";
  tier?: AccessTier;
  roleId?: RoleId;
  aiModel?: AIModel;
  requiresApproval?: boolean;
  conditions?: PolicyCondition[];
}

// ------------------------------------------------------------------
// Baseline engine policies.
// The rules intentionally make writes stricter than reads and keep
// most AI access in `ai-invoke` rather than general `write`.
// ------------------------------------------------------------------

export const POLICIES: PolicyRule[] = [
  { policyId: "emo-read-os", engineId: "emotional-os", label: "OS can read Emotional OS", operation: "read", effect: "allow", tier: "os" },
  { policyId: "emo-read-ministry", engineId: "emotional-os", label: "Ministry can read Emotional OS", operation: "read", effect: "allow", tier: "ministry" },
  { policyId: "emo-write-os", engineId: "emotional-os", label: "OS can modify Emotional OS", operation: "write", effect: "allow", roleId: "ikenga-os" },
  { policyId: "emo-ai-claude", engineId: "emotional-os", label: "Claude can invoke Emotional OS", operation: "ai-invoke", effect: "allow", aiModel: "claude" },
  { policyId: "emo-ai-gpt-deny", engineId: "emotional-os", label: "GPT cannot invoke Emotional OS", operation: "ai-invoke", effect: "deny", aiModel: "gpt" },

  { policyId: "core-read-os", engineId: "core-operations", label: "OS can read Core Operations", operation: "read", effect: "allow", tier: "os" },
  { policyId: "core-read-ministry", engineId: "core-operations", label: "Ministry can read Core Operations", operation: "read", effect: "allow", tier: "ministry" },
  { policyId: "core-write-os", engineId: "core-operations", label: "OS can modify Core Operations", operation: "write", effect: "allow", roleId: "ikenga-os", requiresApproval: true },
  { policyId: "core-write-ministry-admin", engineId: "core-operations", label: "Ministry admin can modify Core Operations with approval", operation: "write", effect: "allow", roleId: "ministry-admin", requiresApproval: true },
  { policyId: "core-ai-claude", engineId: "core-operations", label: "Claude can invoke Core Operations", operation: "ai-invoke", effect: "allow", aiModel: "claude", requiresApproval: true },
  { policyId: "core-ai-gpt", engineId: "core-operations", label: "GPT can invoke Core Operations", operation: "ai-invoke", effect: "allow", aiModel: "gpt", requiresApproval: true },

  { policyId: "evidence-read-os", engineId: "evidence-vault", label: "OS can read Evidence Vault", operation: "read", effect: "allow", tier: "os" },
  { policyId: "evidence-read-ministry", engineId: "evidence-vault", label: "Ministry can read Evidence Vault", operation: "read", effect: "allow", tier: "ministry" },
  { policyId: "evidence-write-deny-ministry", engineId: "evidence-vault", label: "Ministry cannot directly modify Evidence Vault", operation: "write", effect: "deny", tier: "ministry" },
  { policyId: "evidence-write-os", engineId: "evidence-vault", label: "OS can modify Evidence Vault with approval", operation: "write", effect: "allow", roleId: "ikenga-os", requiresApproval: true },
  { policyId: "evidence-ai-claude", engineId: "evidence-vault", label: "Claude can invoke Evidence Vault", operation: "ai-invoke", effect: "allow", aiModel: "claude", requiresApproval: true },
  { policyId: "evidence-ai-gpt-deny", engineId: "evidence-vault", label: "GPT cannot invoke Evidence Vault", operation: "ai-invoke", effect: "deny", aiModel: "gpt" },

  { policyId: "trust-read-os", engineId: "trust-identity", label: "OS can read Trust & Identity", operation: "read", effect: "allow", tier: "os" },
  { policyId: "trust-write-os", engineId: "trust-identity", label: "OS can modify Trust & Identity", operation: "write", effect: "allow", roleId: "ikenga-os", requiresApproval: true },
  { policyId: "trust-ai-claude", engineId: "trust-identity", label: "Claude can invoke Trust & Identity", operation: "ai-invoke", effect: "allow", aiModel: "claude", requiresApproval: true },
  { policyId: "trust-ai-gpt-deny", engineId: "trust-identity", label: "GPT cannot invoke Trust & Identity", operation: "ai-invoke", effect: "deny", aiModel: "gpt" },
  { policyId: "trust-read-ministry-deny", engineId: "trust-identity", label: "Ministry cannot access Trust & Identity directly", operation: "read", effect: "deny", tier: "ministry" },

  { policyId: "market-read-os", engineId: "marketplace", label: "OS can read Marketplace", operation: "read", effect: "allow", tier: "os" },
  { policyId: "market-read-ministry", engineId: "marketplace", label: "Ministry can read Marketplace", operation: "read", effect: "allow", tier: "ministry" },
  { policyId: "market-read-coop", engineId: "marketplace", label: "Cooperatives can read Marketplace", operation: "read", effect: "allow", tier: "cooperative" },
  { policyId: "market-read-public", engineId: "marketplace", label: "Public can read Marketplace", operation: "read", effect: "allow", tier: "public" },
  { policyId: "market-write-os", engineId: "marketplace", label: "OS can modify Marketplace", operation: "write", effect: "allow", roleId: "ikenga-os" },
  { policyId: "market-write-ministry-admin", engineId: "marketplace", label: "Ministry admin can modify Marketplace", operation: "write", effect: "allow", roleId: "ministry-admin" },
  { policyId: "market-write-coop-admin", engineId: "marketplace", label: "Cooperative admin can modify Marketplace", operation: "write", effect: "allow", roleId: "cooperative-admin" },
  { policyId: "market-ai-claude", engineId: "marketplace", label: "Claude can invoke Marketplace", operation: "ai-invoke", effect: "allow", aiModel: "claude" },
  { policyId: "market-ai-gpt", engineId: "marketplace", label: "GPT can invoke Marketplace", operation: "ai-invoke", effect: "allow", aiModel: "gpt" },

  { policyId: "circular-read-os", engineId: "circular-intelligence", label: "OS can read Circular Intelligence", operation: "read", effect: "allow", tier: "os" },
  { policyId: "circular-read-ministry", engineId: "circular-intelligence", label: "Ministry can read Circular Intelligence", operation: "read", effect: "allow", tier: "ministry" },
  { policyId: "circular-read-coop", engineId: "circular-intelligence", label: "Cooperative can read Circular Intelligence", operation: "read", effect: "allow", tier: "cooperative" },
  { policyId: "circular-write-os", engineId: "circular-intelligence", label: "OS can modify Circular Intelligence", operation: "write", effect: "allow", roleId: "ikenga-os" },
  { policyId: "circular-write-ministry-admin", engineId: "circular-intelligence", label: "Ministry admin can modify Circular Intelligence", operation: "write", effect: "allow", roleId: "ministry-admin" },
  { policyId: "circular-write-coop-admin", engineId: "circular-intelligence", label: "Cooperative admin can modify Circular Intelligence", operation: "write", effect: "allow", roleId: "cooperative-admin" },
  { policyId: "circular-ai-claude", engineId: "circular-intelligence", label: "Claude can invoke Circular Intelligence", operation: "ai-invoke", effect: "allow", aiModel: "claude" },
  { policyId: "circular-ai-gpt", engineId: "circular-intelligence", label: "GPT can invoke Circular Intelligence", operation: "ai-invoke", effect: "allow", aiModel: "gpt" },

  { policyId: "financial-read-os", engineId: "financial-banking", label: "OS can read Financial & Banking", operation: "read", effect: "allow", tier: "os" },
  { policyId: "financial-read-ministry", engineId: "financial-banking", label: "Ministry can read Financial & Banking", operation: "read", effect: "allow", tier: "ministry" },
  { policyId: "financial-write-os", engineId: "financial-banking", label: "OS can modify Financial & Banking", operation: "write", effect: "allow", roleId: "ikenga-os", requiresApproval: true },
  { policyId: "financial-write-ministry-admin", engineId: "financial-banking", label: "Ministry admin can modify Financial & Banking with approval", operation: "write", effect: "allow", roleId: "ministry-admin", requiresApproval: true },
  { policyId: "financial-ai-claude", engineId: "financial-banking", label: "Claude can invoke Financial & Banking", operation: "ai-invoke", effect: "allow", aiModel: "claude", requiresApproval: true },
  { policyId: "financial-ai-gpt-deny", engineId: "financial-banking", label: "GPT cannot invoke Financial & Banking", operation: "ai-invoke", effect: "deny", aiModel: "gpt" },

  { policyId: "gov-read-os", engineId: "government-workflows", label: "OS can read Government Workflows", operation: "read", effect: "allow", tier: "os" },
  { policyId: "gov-read-ministry", engineId: "government-workflows", label: "Ministry can read Government Workflows", operation: "read", effect: "allow", tier: "ministry" },
  { policyId: "gov-write-os", engineId: "government-workflows", label: "OS can modify Government Workflows", operation: "write", effect: "allow", roleId: "ikenga-os", requiresApproval: true },
  { policyId: "gov-write-ministry-admin", engineId: "government-workflows", label: "Ministry admin can modify Government Workflows with approval", operation: "write", effect: "allow", roleId: "ministry-admin", requiresApproval: true },
  { policyId: "gov-ai-claude", engineId: "government-workflows", label: "Claude can invoke Government Workflows", operation: "ai-invoke", effect: "allow", aiModel: "claude", requiresApproval: true },
  { policyId: "gov-ai-gpt-deny", engineId: "government-workflows", label: "GPT cannot invoke Government Workflows", operation: "ai-invoke", effect: "deny", aiModel: "gpt" },
];

/**
 * Get all policies for a given engine.
 */
export function getPoliciesForEngine(engineId: EngineId): PolicyRule[] {
  return POLICIES.filter((policy) => policy.engineId === engineId);
}

/**
 * Legacy helper kept for compatibility with earlier code.
 */
export function hasPolicyGrant(engineId: EngineId, tier: AccessTier): boolean {
  const enginePolicies = getPoliciesForEngine(engineId).filter(
    (policy) => policy.operation === "read" && policy.tier === tier
  );

  const hasDeny = enginePolicies.some((policy) => policy.effect === "deny");
  const hasGrant = enginePolicies.some((policy) => policy.effect === "allow");
  return hasGrant && !hasDeny;
}
