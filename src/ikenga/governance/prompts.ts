// ============================================================
// IKENGA GOVERNANCE — PROMPT MANAGEMENT
// Versioned prompt records for every engine.
// Prompts are the IP of IKENGA — versioned, lineage-tracked,
// and never mutated in place.
// ============================================================

import type { EngineId } from "../engine_types";

// ------------------------------------------------------------------
// Prompt status
// ------------------------------------------------------------------

export type PromptStatus = "draft" | "pending-approval" | "approved" | "rejected" | "deprecated";

// ------------------------------------------------------------------
// A single versioned prompt record.
// ------------------------------------------------------------------

export interface PromptRecord {
  promptId: string;       // UUID
  engineId: EngineId;
  version: string;        // Semantic version, e.g. "1.0.0"
  content: string;        // The actual prompt text
  status: PromptStatus;
  createdBy: string;      // Actor who authored this version
  createdAt: string;      // ISO 8601
  approvedBy?: string;    // Actor who approved (if approved)
  approvedAt?: string;    // ISO 8601
  parentPromptId?: string; // ID of the prompt this was derived from
  changeNote: string;     // Human-readable reason for this version
}

// ------------------------------------------------------------------
// Prompt store — in-memory for now; backed by Supabase in Phase 7.
// ------------------------------------------------------------------

const promptStore: PromptRecord[] = [];

// ------------------------------------------------------------------
// CRUD helpers
// ------------------------------------------------------------------

/** Register a new prompt version. */
export function createPrompt(
  data: Omit<PromptRecord, "promptId" | "createdAt" | "status">
): PromptRecord {
  const record: PromptRecord = {
    ...data,
    promptId: crypto.randomUUID(),
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  promptStore.push(record);
  return record;
}

/** Submit a draft prompt for approval. */
export function submitPromptForApproval(promptId: string): PromptRecord | null {
  const record = promptStore.find((p) => p.promptId === promptId);
  if (!record || record.status !== "draft") return null;
  record.status = "pending-approval";
  return record;
}

/** Approve a prompt. */
export function approvePrompt(
  promptId: string,
  approvedBy: string
): PromptRecord | null {
  const record = promptStore.find((p) => p.promptId === promptId);
  if (!record || record.status !== "pending-approval") return null;
  record.status = "approved";
  record.approvedBy = approvedBy;
  record.approvedAt = new Date().toISOString();
  return record;
}

/** Reject a prompt. */
export function rejectPrompt(promptId: string): PromptRecord | null {
  const record = promptStore.find((p) => p.promptId === promptId);
  if (!record || record.status !== "pending-approval") return null;
  record.status = "rejected";
  return record;
}

/** Get the active approved prompt for an engine. */
export function getActivePrompt(engineId: EngineId): PromptRecord | null {
  return (
    promptStore
      .filter((p) => p.engineId === engineId && p.status === "approved")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
  );
}

/** Get all prompts for an engine (full history). */
export function getPromptHistory(engineId: EngineId): PromptRecord[] {
  return promptStore
    .filter((p) => p.engineId === engineId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Rollback to a previous prompt version (creates a new record from parent). */
export function rollbackPrompt(
  promptId: string,
  rolledBackBy: string
): PromptRecord | null {
  const source = promptStore.find((p) => p.promptId === promptId);
  if (!source) return null;

  // Deprecate all current approved prompts for this engine.
  promptStore
    .filter((p) => p.engineId === source.engineId && p.status === "approved")
    .forEach((p) => { p.status = "deprecated"; });

  // Create new record forked from the rollback target.
  return createPrompt({
    engineId: source.engineId,
    version: source.version,
    content: source.content,
    createdBy: rolledBackBy,
    parentPromptId: promptId,
    changeNote: `Rollback to version ${source.version} from ${promptId}`,
  });
}
