// ============================================================
// IKENGA AUDIT - LOG ACTION
// Primary Phase 5 entrypoint for immutable audit writes.
// This module:
// - records actor role and scope metadata
// - hashes payloads and outputs
// - chains entries with the previous entry hash
// - timestamps every entry
// ============================================================

import { createHash, randomUUID } from "node:crypto";

import type { RoleId } from "../access/roles";
import type { AccessTier, AIModel, EngineId } from "../engine_types";
import { appendAuditEntry, getLatestAuditEntry } from "./audit_store";
import type {
  AuditAction,
  AuditActionCategory,
  AuditEntry,
  AuditOutcome,
  AuditScope,
} from "./audit_types";

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalizeValue(nestedValue)])
    );
  }

  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(normalizeValue(value));
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function sanitizePayload(
  payload?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!payload) {
    return undefined;
  }

  return JSON.parse(stableStringify(payload)) as Record<string, unknown>;
}

// ------------------------------------------------------------------
// Input shape for creating one immutable audit entry.
// ------------------------------------------------------------------

export interface LogActionInput {
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
  outcome?: AuditOutcome;
  payload?: Record<string, unknown>;
  rawOutput?: string;
  ipAddress?: string;
  sessionId?: string;
}

/**
 * Build and append an immutable audit entry.
 */
export async function logAction(input: LogActionInput): Promise<AuditEntry> {
  const timestamp = new Date().toISOString();
  const auditId = randomUUID();
  const payload = sanitizePayload(input.payload);
  const payloadHash = payload ? sha256(stableStringify(payload)) : undefined;
  const outputHash = input.rawOutput ? sha256(input.rawOutput) : undefined;
  const previousEntryHash = getLatestAuditEntry()?.entryHash;

  const entryHash = sha256(
    stableStringify({
      auditId,
      action: input.action,
      category: input.category,
      scope: input.scope,
      scopeId: input.scopeId,
      actor: input.actor,
      actorRole: input.actorRole,
      actorTier: input.actorTier,
      engineId: input.engineId,
      targetId: input.targetId,
      aiModel: input.aiModel,
      agentId: input.agentId,
      outcome: input.outcome ?? "success",
      payloadHash,
      outputHash,
      previousEntryHash,
      timestamp,
      ipAddress: input.ipAddress,
      sessionId: input.sessionId,
    })
  );

  const entry: AuditEntry = {
    auditId,
    action: input.action,
    category: input.category,
    scope: input.scope,
    scopeId: input.scopeId,
    actor: input.actor,
    actorRole: input.actorRole,
    actorTier: input.actorTier,
    engineId: input.engineId,
    targetId: input.targetId,
    aiModel: input.aiModel,
    agentId: input.agentId,
    outcome: input.outcome ?? "success",
    payload,
    payloadHash,
    outputHash,
    previousEntryHash,
    entryHash,
    timestamp,
    ipAddress: input.ipAddress,
    sessionId: input.sessionId,
  };

  appendAuditEntry(entry);
  return entry;
}

/**
 * Convenience helper for pipeline audit logging.
 */
export async function auditPipelineRun(input: {
  runId: string;
  engineId: EngineId;
  actor: string;
  actorRole: RoleId | "system";
  actorTier: AccessTier;
  aiModel: AIModel;
  action: "pipeline.start" | "pipeline.complete" | "pipeline.fail";
  synthesis?: string;
  agentId?: string;
  payload?: Record<string, unknown>;
}): Promise<AuditEntry> {
  return logAction({
    action: input.action,
    category: "pipeline",
    scope: "pipeline",
    scopeId: input.runId,
    actor: input.actor,
    actorRole: input.actorRole,
    actorTier: input.actorTier,
    engineId: input.engineId,
    targetId: input.runId,
    aiModel: input.aiModel,
    agentId: input.agentId,
    outcome: input.action === "pipeline.fail" ? "failure" : "success",
    payload: input.payload,
    rawOutput: input.synthesis,
  });
}

/**
 * Convenience helper for deployment audit logging.
 */
export async function auditDeploymentEvent(input: {
  deploymentId: string;
  engineId: EngineId;
  actor: string;
  actorRole: RoleId | "system";
  actorTier: AccessTier;
  action:
    | "deployment.request"
    | "deployment.approve"
    | "deployment.trigger"
    | "deployment.complete"
    | "deployment.fail"
    | "deployment.rollback";
  payload?: Record<string, unknown>;
}): Promise<AuditEntry> {
  return logAction({
    action: input.action,
    category: "deployment",
    scope: "deployment",
    scopeId: input.deploymentId,
    actor: input.actor,
    actorRole: input.actorRole,
    actorTier: input.actorTier,
    engineId: input.engineId,
    targetId: input.deploymentId,
    outcome:
      input.action === "deployment.fail"
        ? "failure"
        : input.action === "deployment.rollback"
          ? "warning"
          : "success",
    payload: input.payload,
  });
}
