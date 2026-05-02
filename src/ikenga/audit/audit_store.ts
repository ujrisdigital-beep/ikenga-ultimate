// ============================================================
// IKENGA AUDIT - STORE
// Append-only in-memory audit store for Phase 5.
// Entries are deeply frozen before insertion so the runtime
// cannot accidentally mutate national-memory records later.
// ============================================================

import type {
  AuditAction,
  AuditActionCategory,
  AuditEntry,
  AuditScope,
} from "./audit_types";
import type { RoleId } from "../access/roles";
import type { EngineId } from "../engine_types";

const auditLog: AuditEntry[] = [];

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);

    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nestedValue);
    }
  }

  return value;
}

/**
 * Append a new immutable audit entry.
 */
export function appendAuditEntry(entry: AuditEntry): void {
  auditLog.push(deepFreeze(entry));
}

/**
 * Return the latest written audit entry, if one exists.
 */
export function getLatestAuditEntry(): AuditEntry | null {
  return auditLog[auditLog.length - 1] ?? null;
}

/**
 * Get all audit entries, newest first.
 */
export function getAllAuditEntries(): AuditEntry[] {
  return [...auditLog].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

/**
 * Get audit entries for one engine.
 */
export function getAuditEntriesForEngine(engineId: EngineId): AuditEntry[] {
  return getAllAuditEntries().filter((entry) => entry.engineId === engineId);
}

/**
 * Get audit entries for one actor.
 */
export function getAuditEntriesForActor(actor: string): AuditEntry[] {
  return getAllAuditEntries().filter((entry) => entry.actor === actor);
}

/**
 * Get audit entries for one actor role.
 */
export function getAuditEntriesForRole(roleId: RoleId | "system"): AuditEntry[] {
  return getAllAuditEntries().filter((entry) => entry.actorRole === roleId);
}

/**
 * Get entries for a specific action type.
 */
export function getAuditEntriesByAction(action: AuditAction): AuditEntry[] {
  return getAllAuditEntries().filter((entry) => entry.action === action);
}

/**
 * Get entries for a top-level category.
 */
export function getAuditEntriesByCategory(
  category: AuditActionCategory
): AuditEntry[] {
  return getAllAuditEntries().filter((entry) => entry.category === category);
}

/**
 * Get entries for a specific scope and optional scope id.
 */
export function getAuditEntriesByScope(
  scope: AuditScope,
  scopeId?: string
): AuditEntry[] {
  return getAllAuditEntries().filter(
    (entry) => entry.scope === scope && (scopeId ? entry.scopeId === scopeId : true)
  );
}

/**
 * Find a single audit entry by id.
 */
export function getAuditEntryById(auditId: string): AuditEntry | null {
  return auditLog.find((entry) => entry.auditId === auditId) ?? null;
}

/**
 * Return entries in an ISO timestamp range.
 */
export function getAuditEntriesInRange(from: string, to: string): AuditEntry[] {
  return getAllAuditEntries().filter(
    (entry) => entry.timestamp >= from && entry.timestamp <= to
  );
}

/**
 * Return the total entry count.
 */
export function getAuditEntryCount(): number {
  return auditLog.length;
}
