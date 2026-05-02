/**
 * Phase 1 engine type definitions.
 *
 * This file is the contract for the engine registry. Keeping the shared
 * shapes here makes the rest of the module easy to reason about and keeps
 * Supabase payloads aligned with the in-memory registry.
 */

/**
 * Canonical list of engine identifiers used across the registry and DB.
 */
export const ENGINE_IDS = [
  "emotional-os",
  "core-operations",
  "evidence-vault",
  "trust-identity",
  "marketplace",
  "circular-intelligence",
  "financial-banking",
  "government-workflows",
] as const;

export type EngineId = (typeof ENGINE_IDS)[number];

/**
 * Simple lifecycle flag for each engine entry.
 */
export type EngineStatus = "active" | "inactive" | "maintenance";

/**
 * Broad grouping used for filtering and future orchestration decisions.
 */
export type EngineCategory =
  | "operating-system"
  | "operations"
  | "evidence"
  | "identity"
  | "commerce"
  | "intelligence"
  | "finance"
  | "government";

/**
 * Placeholder credential metadata for Phase 1.
 *
 * We are not storing real secrets in code. This object only names the env var
 * and placeholder string that each engine can use later when integrations are
 * connected.
 */
export interface EngineApiConfig {
  envVar: string;
  placeholder: string;
}

/**
 * Main registry record used by the app.
 */
export interface EngineDefinition {
  id: EngineId;
  name: string;
  path: `/engines/${string}`;
  description: string;
  category: EngineCategory;
  status: EngineStatus;
  api: EngineApiConfig;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shape inserted into the Supabase `engines` table.
 *
 * Snake case matches the SQL schema so we can upsert records directly.
 */
export interface EngineRow {
  id: EngineId;
  name: string;
  path: string;
  description: string;
  category: EngineCategory;
  status: EngineStatus;
  api_key_env_var: string;
  api_key_placeholder: string;
  created_at: string;
  updated_at: string;
}

/**
 * Narrow input for creating or updating a single engine record.
 */
export type RegisterEngineInput = EngineDefinition;
