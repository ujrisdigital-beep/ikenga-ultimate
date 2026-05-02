// ============================================================
// IKENGA ENGINE TYPES
// Core type definitions for the 8 sovereign engine registry.
// ============================================================

/** Unique identifiers for each IKENGA engine. */
export type EngineId =
  | "emotional-os"
  | "core-operations"
  | "evidence-vault"
  | "trust-identity"
  | "marketplace"
  | "circular-intelligence"
  | "financial-banking"
  | "government-workflows";

/** Lifecycle status of an engine. */
export type EngineStatus = "active" | "inactive" | "deprecated" | "maintenance";

/** Semantic version string, e.g. "1.0.0". */
export type SemVer = `${number}.${number}.${number}`;

/** Which tier of actor may call this engine. */
export type AccessTier =
  | "os"         // Operating System level — highest privilege
  | "ministry"   // Government ministry
  | "cooperative"// Business cooperative / enterprise
  | "public";    // Authenticated public user

/** AI model identifiers used in the orchestration pipeline. */
export type AIModel = "claude" | "copilot" | "gpt" | "gemini" | "ikenga";

// ------------------------------------------------------------------
// Engine Metadata
// ------------------------------------------------------------------

export interface EngineMetadata {
  id: EngineId;
  name: string;
  description: string;
  url: string;             // Internal API path, e.g. /engines/emotional-os
  version: SemVer;
  status: EngineStatus;
  accessTier: AccessTier;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}

// ------------------------------------------------------------------
// Engine Version Record
// ------------------------------------------------------------------

export interface EngineVersion {
  engineId: EngineId;
  version: SemVer;
  changelog: string;
  deployedAt: string;      // ISO 8601
  deployedBy: string;      // Actor identifier
  parentVersion: SemVer | null;
}

// ------------------------------------------------------------------
// Engine Lineage
// Tracks the chain of versions for auditability.
// ------------------------------------------------------------------

export interface EngineLineage {
  engineId: EngineId;
  versions: EngineVersion[];
  currentVersion: SemVer;
}

// ------------------------------------------------------------------
// Engine Permission
// ------------------------------------------------------------------

export interface EnginePermission {
  engineId: EngineId;
  allowedTiers: AccessTier[];
  allowedAIModels: AIModel[];   // Which AI agents may invoke this engine
  readOnly: boolean;            // If true, engine rejects mutation requests
  requiresApproval: boolean;    // If true, actions need governance sign-off
}
