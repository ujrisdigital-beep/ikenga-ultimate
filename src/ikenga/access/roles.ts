// ============================================================
// IKENGA ACCESS - ROLES
// Phase 6 sovereign role definitions.
// Roles capture what a human or AI actor is generally allowed
// to do before engine-specific policies are evaluated.
// ============================================================

import type { AccessTier } from "../engine_types";

// ------------------------------------------------------------------
// Stable role identifiers used across the access layer.
// ------------------------------------------------------------------

export type RoleId =
  | "ikenga-os"
  | "ministry-admin"
  | "ministry-user"
  | "cooperative-admin"
  | "cooperative-user"
  | "public-user"
  | "ai-agent";

// ------------------------------------------------------------------
// Role capabilities describe the baseline powers of a role before
// engine-level policy checks are applied.
// ------------------------------------------------------------------

export interface RoleCapabilities {
  canApprove: boolean;
  canDeploy: boolean;
  canWriteAudit: boolean;
  canManagePrompts: boolean;
  canManageAccess: boolean;
  canModifyEngines: boolean;
}

export interface Role {
  roleId: RoleId;
  label: string;
  tier: AccessTier;
  capabilities: RoleCapabilities;
}

// ------------------------------------------------------------------
// Sovereign role registry.
// ------------------------------------------------------------------

export const ROLES: Record<RoleId, Role> = {
  "ikenga-os": {
    roleId: "ikenga-os",
    label: "IKENGA Operating System",
    tier: "os",
    capabilities: {
      canApprove: true,
      canDeploy: true,
      canWriteAudit: true,
      canManagePrompts: true,
      canManageAccess: true,
      canModifyEngines: true,
    },
  },
  "ministry-admin": {
    roleId: "ministry-admin",
    label: "Ministry Administrator",
    tier: "ministry",
    capabilities: {
      canApprove: true,
      canDeploy: true,
      canWriteAudit: false,
      canManagePrompts: true,
      canManageAccess: false,
      canModifyEngines: false,
    },
  },
  "ministry-user": {
    roleId: "ministry-user",
    label: "Ministry Staff",
    tier: "ministry",
    capabilities: {
      canApprove: false,
      canDeploy: false,
      canWriteAudit: false,
      canManagePrompts: false,
      canManageAccess: false,
      canModifyEngines: false,
    },
  },
  "cooperative-admin": {
    roleId: "cooperative-admin",
    label: "Cooperative Administrator",
    tier: "cooperative",
    capabilities: {
      canApprove: false,
      canDeploy: false,
      canWriteAudit: false,
      canManagePrompts: true,
      canManageAccess: false,
      canModifyEngines: false,
    },
  },
  "cooperative-user": {
    roleId: "cooperative-user",
    label: "Cooperative Staff",
    tier: "cooperative",
    capabilities: {
      canApprove: false,
      canDeploy: false,
      canWriteAudit: false,
      canManagePrompts: false,
      canManageAccess: false,
      canModifyEngines: false,
    },
  },
  "public-user": {
    roleId: "public-user",
    label: "Public User",
    tier: "public",
    capabilities: {
      canApprove: false,
      canDeploy: false,
      canWriteAudit: false,
      canManagePrompts: false,
      canManageAccess: false,
      canModifyEngines: false,
    },
  },
  "ai-agent": {
    roleId: "ai-agent",
    label: "AI Agent",
    tier: "cooperative",
    capabilities: {
      canApprove: false,
      canDeploy: false,
      canWriteAudit: false,
      canManagePrompts: false,
      canManageAccess: false,
      canModifyEngines: false,
    },
  },
};

/**
 * Look up a role by id.
 */
export function getRole(roleId: RoleId): Role | null {
  return ROLES[roleId] ?? null;
}

/**
 * Return every role whose tier is at or above the supplied tier.
 */
export function getRolesForTier(tier: AccessTier): Role[] {
  const tierOrder: AccessTier[] = ["os", "ministry", "cooperative", "public"];
  const tierIndex = tierOrder.indexOf(tier);

  return Object.values(ROLES).filter(
    (role) => tierOrder.indexOf(role.tier) <= tierIndex
  );
}

/**
 * Helper for checking a specific capability on a role.
 */
export function roleHasCapability(
  roleId: RoleId,
  capability: keyof RoleCapabilities
): boolean {
  return ROLES[roleId]?.capabilities[capability] ?? false;
}
