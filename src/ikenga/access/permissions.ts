// ============================================================
// IKENGA ACCESS - PERMISSIONS
// Phase 6 runtime sovereignty checks combining:
// - actor roles
// - engine-level permissions
// - explicit policy rules
// - approval and read-only constraints
// ============================================================

import type { AIModel, EngineId } from "../engine_types";
import {
  canAIAccess,
  canTierAccess,
  ENGINE_PERMISSIONS,
  requiresApproval,
} from "../engine_permissions";
import type { AccessOperation, PolicyCondition, PolicyRule } from "./policies";
import { getPoliciesForEngine } from "./policies";
import type { RoleId } from "./roles";
import { getRole, roleHasCapability } from "./roles";

// ------------------------------------------------------------------
// Actor and permission result contracts.
// ------------------------------------------------------------------

export interface Actor {
  actorId: string;
  roleId: RoleId;
  displayName?: string;
}

export interface PermissionContext {
  environment?: "development" | "staging" | "production";
  operation?: AccessOperation;
}

export interface PermissionResult {
  allowed: boolean;
  reason: string;
  requiresApproval: boolean;
  matchedPolicyIds: string[];
  readOnly: boolean;
}

function evaluateCondition(
  condition: PolicyCondition,
  values: Record<string, unknown>
): boolean {
  const currentValue = values[condition.field];

  switch (condition.operator) {
    case "eq":
      return currentValue === condition.value;
    case "neq":
      return currentValue !== condition.value;
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(currentValue as never);
    case "not-in":
      return Array.isArray(condition.value) && !condition.value.includes(currentValue as never);
    default:
      return false;
  }
}

function policyMatches(
  policy: PolicyRule,
  roleId: RoleId | undefined,
  tier: string | undefined,
  aiModel: AIModel | undefined,
  operation: AccessOperation,
  context: PermissionContext,
  engineId: EngineId
): boolean {
  if (policy.engineId !== engineId || policy.operation !== operation) {
    return false;
  }

  if (policy.roleId && policy.roleId !== roleId) {
    return false;
  }

  if (policy.tier && policy.tier !== tier) {
    return false;
  }

  if (policy.aiModel && policy.aiModel !== aiModel) {
    return false;
  }

  if (!policy.conditions?.length) {
    return true;
  }

  const enginePermission = ENGINE_PERMISSIONS[engineId];

  return policy.conditions.every((condition) =>
    evaluateCondition(condition, {
      environment: context.environment,
      requiresApproval: enginePermission?.requiresApproval ?? false,
      readOnly: enginePermission?.readOnly ?? false,
    })
  );
}

function buildDeniedResult(reason: string): PermissionResult {
  return {
    allowed: false,
    reason,
    requiresApproval: false,
    matchedPolicyIds: [],
    readOnly: false,
  };
}

function resolvePolicyResult(
  matchingPolicies: PolicyRule[],
  engineId: EngineId
): PermissionResult {
  const denyPolicies = matchingPolicies.filter((policy) => policy.effect === "deny");

  if (denyPolicies.length > 0) {
    return {
      allowed: false,
      reason: `Access denied by policy '${denyPolicies[0].policyId}'.`,
      requiresApproval: false,
      matchedPolicyIds: denyPolicies.map((policy) => policy.policyId),
      readOnly: ENGINE_PERMISSIONS[engineId]?.readOnly ?? false,
    };
  }

  const allowPolicies = matchingPolicies.filter((policy) => policy.effect === "allow");

  if (allowPolicies.length === 0) {
    return {
      allowed: false,
      reason: "No matching sovereign policy grants this access.",
      requiresApproval: false,
      matchedPolicyIds: [],
      readOnly: ENGINE_PERMISSIONS[engineId]?.readOnly ?? false,
    };
  }

  const approvalRequired =
    allowPolicies.some((policy) => policy.requiresApproval) || requiresApproval(engineId);

  return {
    allowed: true,
    reason: `Access granted by policy '${allowPolicies[0].policyId}'.`,
    requiresApproval: approvalRequired,
    matchedPolicyIds: allowPolicies.map((policy) => policy.policyId),
    readOnly: ENGINE_PERMISSIONS[engineId]?.readOnly ?? false,
  };
}

/**
 * Check whether a human actor may perform an operation on an engine.
 */
export function checkActorAccess(
  actor: Actor,
  engineId: EngineId,
  operation: AccessOperation = "read",
  context: PermissionContext = {}
): PermissionResult {
  const role = getRole(actor.roleId);

  if (!role) {
    return buildDeniedResult(`Unknown role '${actor.roleId}'.`);
  }

  if ((operation === "read" || operation === "write") && !canTierAccess(engineId, role.tier)) {
    return buildDeniedResult(
      `Role '${role.label}' (tier: ${role.tier}) does not have baseline access to engine '${engineId}'.`
    );
  }

  if (operation === "approve" && !role.capabilities.canApprove) {
    return buildDeniedResult(`Role '${role.label}' cannot approve governance requests.`);
  }

  if (operation === "deploy" && !role.capabilities.canDeploy) {
    return buildDeniedResult(`Role '${role.label}' cannot trigger deployments.`);
  }

  if (operation === "manage-prompts" && !role.capabilities.canManagePrompts) {
    return buildDeniedResult(`Role '${role.label}' cannot manage prompts.`);
  }

  if (operation === "write-audit" && !role.capabilities.canWriteAudit) {
    return buildDeniedResult(`Role '${role.label}' cannot write audit entries directly.`);
  }

  if (operation === "write" && ENGINE_PERMISSIONS[engineId]?.readOnly && actor.roleId !== "ikenga-os") {
    return buildDeniedResult(`Engine '${engineId}' is read-only for role '${role.label}'.`);
  }

  const matchingPolicies = getPoliciesForEngine(engineId).filter((policy) =>
    policyMatches(policy, actor.roleId, role.tier, undefined, operation, context, engineId)
  );

  return resolvePolicyResult(matchingPolicies, engineId);
}

/**
 * Check whether an AI model may perform an engine invocation or write action.
 */
export function checkAIAccess(
  model: AIModel,
  engineId: EngineId,
  operation: Extract<AccessOperation, "ai-invoke" | "write"> = "ai-invoke",
  context: PermissionContext = {}
): PermissionResult {
  if (operation === "ai-invoke" && !canAIAccess(engineId, model)) {
    return buildDeniedResult(`AI model '${model}' is not permitted to access engine '${engineId}'.`);
  }

  if (operation === "write" && model !== "ikenga") {
    return buildDeniedResult(`AI model '${model}' may not directly modify engine '${engineId}'.`);
  }

  const matchingPolicies = getPoliciesForEngine(engineId).filter((policy) =>
    policyMatches(policy, undefined, undefined, model, operation, context, engineId)
  );

  return resolvePolicyResult(matchingPolicies, engineId);
}

/**
 * Check whether an actor can approve governance requests.
 */
export function canActorApprove(actor: Actor): boolean {
  return roleHasCapability(actor.roleId, "canApprove");
}

/**
 * Check whether an actor can trigger deployments.
 */
export function canActorDeploy(actor: Actor): boolean {
  return roleHasCapability(actor.roleId, "canDeploy");
}

/**
 * Check whether an actor can manage prompts.
 */
export function canActorManagePrompts(actor: Actor): boolean {
  return roleHasCapability(actor.roleId, "canManagePrompts");
}

/**
 * Check whether an actor can write directly to the audit trail.
 */
export function canActorWriteAudit(actor: Actor): boolean {
  return roleHasCapability(actor.roleId, "canWriteAudit");
}
