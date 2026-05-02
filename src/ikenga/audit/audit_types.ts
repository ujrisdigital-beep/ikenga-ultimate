// ============================================================
// IKENGA AUDIT - TYPES
// Phase 5 audit trail contracts for:
// - agent logging
// - role logging
// - scope logging
// - output hashing
// - timestamped immutable entries
// ============================================================

import type { RoleId } from "../access/roles";
import type { AccessTier, AIModel, EngineId } from "../engine_types";

// ------------------------------------------------------------------
// Top-level audit categories.
// ------------------------------------------------------------------

export type AuditActionCategory =
  | "engine"
  | "prompt"
  | "deployment"
  | "pipeline"
  | "access"
  | "approval"
  | "auth"
  | "content";

// ------------------------------------------------------------------
// Specific audited actions.
// ------------------------------------------------------------------

export type AuditAction =
  | "engine.register"
  | "engine.update"
  | "engine.deprecate"
  | "prompt.create"
  | "prompt.submit"
  | "prompt.approve"
  | "prompt.reject"
  | "prompt.rollback"
  | "deployment.request"
  | "deployment.approve"
  | "deployment.trigger"
  | "deployment.complete"
  | "deployment.fail"
  | "deployment.rollback"
  | "pipeline.start"
  | "pipeline.step"
  | "pipeline.complete"
  | "pipeline.fail"
  | "access.grant"
  | "access.revoke"
  | "approval.request"
  | "approval.grant"
  | "approval.deny"
  | "approval.withdraw"
  | "auth.login"
  | "auth.logout"
  | "content.generate"
  | "content.evaluate"
  | "content.feedback";

// ------------------------------------------------------------------
// Scope gives the audit trail a clear boundary for each event.
// ------------------------------------------------------------------

export type AuditScope =
  | "platform"
  | "engine"
  | "pipeline"
  | "deployment"
  | "prompt"
  | "access"
  | "auth"
  | "content"
  | "session";

// ------------------------------------------------------------------
// Outcome makes it easy to filter success/failure trails.
// ------------------------------------------------------------------

export type AuditOutcome = "success" | "failure" | "warning";

// ------------------------------------------------------------------
// Immutable audit entry written to the append-only store.
// ------------------------------------------------------------------

export interface AuditEntry {
  auditId: string;
  action: AuditAction;
  category: AuditActionCategory;
  scope: AuditScope;
  scopeId?: string;
  actor: string;
  actorRole: RoleId | "system";
  actorTier: AccessTier;
  engineId?: EngineId;
  targetId?: string;
  aiModel?: AIModel;
  agentId?: string;
  outcome: AuditOutcome;
  payload?: Record<string, unknown>;
  payloadHash?: string;
  outputHash?: string;
  previousEntryHash?: string;
  entryHash: string;
  timestamp: string;
  ipAddress?: string;
  sessionId?: string;
}
