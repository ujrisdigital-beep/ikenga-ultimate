/**
 * Phase 1 engine registry.
 *
 * This file is the source of truth for the 8 engines requested for the first
 * implementation pass. It exposes both the ordered list and fast lookup maps
 * so other modules can seed, query, or validate engine definitions reliably.
 */

import type { EngineDefinition, EngineId } from "./engineTypes";

const PHASE_ONE_TIMESTAMP = "2026-04-02T00:00:00.000Z";

/**
 * Ordered engine list used for rendering, seeding, and migrations.
 */
export const ENGINE_REGISTRY: EngineDefinition[] = [
  {
    id: "emotional-os",
    name: "Emotional OS",
    path: "/engines/emotional-os",
    description:
      "Monitors sentiment, resonance, and emotional continuity across the platform.",
    category: "operating-system",
    status: "active",
    api: {
      envVar: "EMOTIONAL_OS_API_KEY",
      placeholder: "PLACEHOLDER_EMOTIONAL_OS_API_KEY",
    },
    createdAt: PHASE_ONE_TIMESTAMP,
    updatedAt: PHASE_ONE_TIMESTAMP,
  },
  {
    id: "core-operations",
    name: "Core Operations",
    path: "/engines/core-operations",
    description:
      "Coordinates task routing, execution state, and backbone operational workflows.",
    category: "operations",
    status: "active",
    api: {
      envVar: "CORE_OPERATIONS_API_KEY",
      placeholder: "PLACEHOLDER_CORE_OPERATIONS_API_KEY",
    },
    createdAt: PHASE_ONE_TIMESTAMP,
    updatedAt: PHASE_ONE_TIMESTAMP,
  },
  {
    id: "evidence-vault",
    name: "Evidence Vault",
    path: "/engines/evidence-vault",
    description:
      "Stores verifiable records, supporting documents, and audit-grade evidence artifacts.",
    category: "evidence",
    status: "active",
    api: {
      envVar: "EVIDENCE_VAULT_API_KEY",
      placeholder: "PLACEHOLDER_EVIDENCE_VAULT_API_KEY",
    },
    createdAt: PHASE_ONE_TIMESTAMP,
    updatedAt: PHASE_ONE_TIMESTAMP,
  },
  {
    id: "trust-identity",
    name: "Trust & Identity",
    path: "/engines/trust-identity",
    description:
      "Handles identity assurance, trust signals, and actor verification workflows.",
    category: "identity",
    status: "active",
    api: {
      envVar: "TRUST_IDENTITY_API_KEY",
      placeholder: "PLACEHOLDER_TRUST_IDENTITY_API_KEY",
    },
    createdAt: PHASE_ONE_TIMESTAMP,
    updatedAt: PHASE_ONE_TIMESTAMP,
  },
  {
    id: "marketplace",
    name: "BuyGambia Marketplace",
    path: "/engines/marketplace",
    description:
      "Powers listings, merchant operations, orders, and transaction-ready marketplace flows.",
    category: "commerce",
    status: "active",
    api: {
      envVar: "MARKETPLACE_API_KEY",
      placeholder: "PLACEHOLDER_MARKETPLACE_API_KEY",
    },
    createdAt: PHASE_ONE_TIMESTAMP,
    updatedAt: PHASE_ONE_TIMESTAMP,
  },
  {
    id: "circular-intelligence",
    name: "Circular Intelligence",
    path: "/engines/circular-intelligence",
    description:
      "Tracks reuse loops, material intelligence, and regenerative system insights.",
    category: "intelligence",
    status: "active",
    api: {
      envVar: "CIRCULAR_INTELLIGENCE_API_KEY",
      placeholder: "PLACEHOLDER_CIRCULAR_INTELLIGENCE_API_KEY",
    },
    createdAt: PHASE_ONE_TIMESTAMP,
    updatedAt: PHASE_ONE_TIMESTAMP,
  },
  {
    id: "financial-banking",
    name: "Financial & Banking",
    path: "/engines/financial-banking",
    description:
      "Supports ledgers, payments, banking integrations, and finance-grade workflows.",
    category: "finance",
    status: "active",
    api: {
      envVar: "FINANCIAL_BANKING_API_KEY",
      placeholder: "PLACEHOLDER_FINANCIAL_BANKING_API_KEY",
    },
    createdAt: PHASE_ONE_TIMESTAMP,
    updatedAt: PHASE_ONE_TIMESTAMP,
  },
  {
    id: "government-workflows",
    name: "Government Workflows",
    path: "/engines/government-workflows",
    description:
      "Runs public service processes, approvals, and government-facing workflow automation.",
    category: "government",
    status: "active",
    api: {
      envVar: "GOVERNMENT_WORKFLOWS_API_KEY",
      placeholder: "PLACEHOLDER_GOVERNMENT_WORKFLOWS_API_KEY",
    },
    createdAt: PHASE_ONE_TIMESTAMP,
    updatedAt: PHASE_ONE_TIMESTAMP,
  },
];

/**
 * Fast lookup by engine id for registry consumers.
 */
export const ENGINE_REGISTRY_BY_ID: Record<EngineId, EngineDefinition> =
  Object.fromEntries(
    ENGINE_REGISTRY.map((engine) => [engine.id, engine])
  ) as Record<EngineId, EngineDefinition>;

/**
 * Return every registered Phase 1 engine.
 */
export function listEngines(): EngineDefinition[] {
  return ENGINE_REGISTRY;
}

/**
 * Return one engine by id, or null when the id is not registered.
 */
export function getEngineById(id: EngineId): EngineDefinition | null {
  return ENGINE_REGISTRY_BY_ID[id] ?? null;
}

/**
 * Resolve an engine by its internal route path.
 */
export function getEngineByPath(path: string): EngineDefinition | null {
  return ENGINE_REGISTRY.find((engine) => engine.path === path) ?? null;
}
