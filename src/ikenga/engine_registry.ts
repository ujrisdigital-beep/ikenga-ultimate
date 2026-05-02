// ============================================================
// IKENGA ENGINE REGISTRY
// Server-side registry of all 8 sovereign engines.
// Import this only in server components or API routes.
// ============================================================

import type {
  EngineId,
  EngineLineage,
  EngineMetadata,
  EngineVersion,
} from "./engine_types";

// ------------------------------------------------------------------
// Static engine metadata — source of truth for all 8 engines.
// ------------------------------------------------------------------

export const ENGINE_REGISTRY: Record<EngineId, EngineMetadata> = {
  "emotional-os": {
    id: "emotional-os",
    name: "Emotional OS",
    description:
      "Reads brand rhythm, detects emotional inconsistency, and guides strategic next moves to keep presence alive.",
    url: "/engines/emotional-os",
    version: "1.0.0",
    status: "active",
    accessTier: "os",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  "core-operations": {
    id: "core-operations",
    name: "Core Operations",
    description:
      "Central operational backbone for managing workflows, task orchestration, and system coordination across IKENGA.",
    url: "/engines/core-operations",
    version: "1.0.0",
    status: "active",
    accessTier: "ministry",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  "evidence-vault": {
    id: "evidence-vault",
    name: "Evidence Vault",
    description:
      "Immutable storage and retrieval engine for records, proofs, attestations, and sovereign data artefacts.",
    url: "/engines/evidence-vault",
    version: "1.0.0",
    status: "active",
    accessTier: "ministry",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  "trust-identity": {
    id: "trust-identity",
    name: "Trust & Identity",
    description:
      "Manages identity verification, role attestation, and trust scoring for actors across the IKENGA ecosystem.",
    url: "/engines/trust-identity",
    version: "1.0.0",
    status: "active",
    accessTier: "os",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  marketplace: {
    id: "marketplace",
    name: "BuyGambia Marketplace",
    description:
      "Sovereign commerce engine powering product listings, transactions, and vendor management for BuyGambia.",
    url: "/engines/marketplace",
    version: "1.0.0",
    status: "active",
    accessTier: "cooperative",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  "circular-intelligence": {
    id: "circular-intelligence",
    name: "Circular Intelligence",
    description:
      "Sustainability and circular economy engine for tracking resource flows, impact metrics, and regenerative loops.",
    url: "/engines/circular-intelligence",
    version: "1.0.0",
    status: "active",
    accessTier: "cooperative",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  "financial-banking": {
    id: "financial-banking",
    name: "Financial & Banking",
    description:
      "Sovereign financial engine handling payments, ledgers, credit scoring, and banking workflow integration.",
    url: "/engines/financial-banking",
    version: "1.0.0",
    status: "active",
    accessTier: "ministry",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  "government-workflows": {
    id: "government-workflows",
    name: "Government Workflows",
    description:
      "Automates and tracks government service delivery, approvals, procurement, and inter-ministry coordination.",
    url: "/engines/government-workflows",
    version: "1.0.0",
    status: "active",
    accessTier: "ministry",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },
};

// ------------------------------------------------------------------
// Lineage store — tracks version history for each engine.
// In production, this is persisted in Supabase (engine_versions table).
// ------------------------------------------------------------------

const INITIAL_VERSION: EngineVersion = {
  engineId: "emotional-os",
  version: "1.0.0",
  changelog: "Initial sovereign deployment.",
  deployedAt: "2026-04-01T00:00:00Z",
  deployedBy: "ikenga-os",
  parentVersion: null,
};

export const ENGINE_LINEAGE: Record<EngineId, EngineLineage> = Object.fromEntries(
  (Object.keys(ENGINE_REGISTRY) as EngineId[]).map((id) => [
    id,
    {
      engineId: id,
      versions: [{ ...INITIAL_VERSION, engineId: id }],
      currentVersion: "1.0.0",
    },
  ])
) as unknown as Record<EngineId, EngineLineage>;

// ------------------------------------------------------------------
// Registry helpers
// ------------------------------------------------------------------

/** Return metadata for a single engine, or null if not found. */
export function getEngine(id: EngineId): EngineMetadata | null {
  return ENGINE_REGISTRY[id] ?? null;
}

/** Return all active engines. */
export function getActiveEngines(): EngineMetadata[] {
  return Object.values(ENGINE_REGISTRY).filter((e) => e.status === "active");
}

/** Return the current version lineage for an engine. */
export function getEngineLineage(id: EngineId): EngineLineage | null {
  return ENGINE_LINEAGE[id] ?? null;
}
