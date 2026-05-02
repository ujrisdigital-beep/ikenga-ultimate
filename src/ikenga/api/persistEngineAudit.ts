// ============================================================
// IKENGA API - PERSIST ENGINE AUDIT
// Shared helper for Phase 7 route handlers. It writes an audit
// entry to the in-memory audit layer and mirrors the same record
// into the `engine_audit_logs` Supabase table.
// ============================================================

import { supabase } from "../lib/supabase";
import { logAction, type LogActionInput } from "../audit/logAction";

/**
 * Write one audit entry to memory and to Supabase.
 */
export async function persistEngineAudit(input: LogActionInput) {
  const entry = await logAction(input);

  const { error } = await supabase.from("engine_audit_logs").insert({
    audit_id: entry.auditId,
    action: entry.action,
    category: entry.category,
    scope: entry.scope,
    scope_id: entry.scopeId ?? null,
    actor: entry.actor,
    actor_role: entry.actorRole,
    actor_tier: entry.actorTier,
    engine_id: entry.engineId ?? null,
    target_id: entry.targetId ?? null,
    ai_model: entry.aiModel ?? null,
    agent_id: entry.agentId ?? null,
    outcome: entry.outcome,
    payload: entry.payload ?? null,
    payload_hash: entry.payloadHash ?? null,
    output_hash: entry.outputHash ?? null,
    previous_entry_hash: entry.previousEntryHash ?? null,
    entry_hash: entry.entryHash,
    timestamp: entry.timestamp,
    ip_address: entry.ipAddress ?? null,
    session_id: entry.sessionId ?? null,
  });

  if (error) {
    throw new Error(`Failed to persist audit entry ${entry.auditId}: ${error.message}`);
  }

  return entry;
}
