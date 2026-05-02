// ============================================================
// IKENGA GOVERNANCE - DEPLOYMENT MANAGEMENT
// Phase 4 deployment governance covering:
// - deployment request objects
// - approval and rejection flows
// - server-side Vercel trigger stubs
// - rollback creation
// - in-memory state for local development
// ============================================================

import { randomUUID } from "node:crypto";

import type { EngineId, SemVer } from "../engine_types";
import { logDeploymentEvent } from "./deployment_logs";
import {
  denyApproval,
  grantApproval,
  isApproved,
  requestApproval,
} from "./approvals";

// ------------------------------------------------------------------
// Deployment lifecycle states.
// ------------------------------------------------------------------

export type DeploymentStatus =
  | "requested"
  | "pending-approval"
  | "approved"
  | "deploying"
  | "deployed"
  | "failed"
  | "rolled-back";

export type DeploymentEnvironment = "development" | "staging" | "production";

// ------------------------------------------------------------------
// Main deployment request object for Phase 4 governance.
// ------------------------------------------------------------------

export interface DeploymentRequest {
  deploymentId: string;
  engineId: EngineId;
  version: SemVer;
  environment: DeploymentEnvironment;
  requestedBy: string;
  requestedAt: string;
  status: DeploymentStatus;
  approvalRequestId?: string;
  approvedBy?: string;
  approvedAt?: string;
  deployedAt?: string;
  deployedBy?: string;
  rollbackTargetId?: string;
  vercelDeploymentId?: string;
  deploymentUrl?: string;
  errorMessage?: string;
}

// ------------------------------------------------------------------
// In-memory deployment store. Phase 7 can swap this for Supabase.
// ------------------------------------------------------------------

const deploymentStore: DeploymentRequest[] = [];

function getDeploymentById(deploymentId: string): DeploymentRequest | null {
  return deploymentStore.find((deployment) => deployment.deploymentId === deploymentId) ?? null;
}

/**
 * Create a new deployment request without triggering deployment.
 */
export function createDeploymentRequest(
  data: Omit<DeploymentRequest, "deploymentId" | "requestedAt" | "status">
): DeploymentRequest {
  const record: DeploymentRequest = {
    ...data,
    deploymentId: randomUUID(),
    requestedAt: new Date().toISOString(),
    status: "requested",
  };

  deploymentStore.push(record);

  logDeploymentEvent({
    deploymentId: record.deploymentId,
    engineId: record.engineId,
    event: "requested",
    actor: record.requestedBy,
    detail: `Deployment request created for ${record.engineId} v${record.version} in ${record.environment}.`,
  });

  return record;
}

/**
 * Submit a deployment request into the governance approval queue.
 */
export function submitDeploymentForApproval(deploymentId: string): DeploymentRequest | null {
  const deployment = getDeploymentById(deploymentId);

  if (!deployment || deployment.status !== "requested") {
    return null;
  }

  const approval = requestApproval({
    targetType: "deployment",
    targetId: deploymentId,
    requestedBy: deployment.requestedBy,
    reason: `Deploy engine '${deployment.engineId}' v${deployment.version} to ${deployment.environment}.`,
  });

  deployment.status = "pending-approval";
  deployment.approvalRequestId = approval.requestId;

  logDeploymentEvent({
    deploymentId,
    engineId: deployment.engineId,
    event: "pending-approval",
    actor: deployment.requestedBy,
    detail: `Deployment request submitted for approval with request ID ${approval.requestId}.`,
  });

  return deployment;
}

/**
 * Approve a deployment request after governance review.
 */
export function approveDeploymentRequest(
  deploymentId: string,
  reviewedBy: string,
  reviewNote?: string
): DeploymentRequest | null {
  const deployment = getDeploymentById(deploymentId);

  if (!deployment || deployment.status !== "pending-approval" || !deployment.approvalRequestId) {
    return null;
  }

  const approval = grantApproval(deployment.approvalRequestId, reviewedBy, reviewNote);

  if (!approval) {
    return null;
  }

  deployment.status = "approved";
  deployment.approvedBy = reviewedBy;
  deployment.approvedAt = approval.reviewedAt;

  logDeploymentEvent({
    deploymentId,
    engineId: deployment.engineId,
    event: "approved",
    actor: reviewedBy,
    detail: reviewNote ?? "Deployment approved.",
  });

  return deployment;
}

/**
 * Reject a deployment request after governance review.
 */
export function rejectDeploymentRequest(
  deploymentId: string,
  reviewedBy: string,
  reviewNote?: string
): DeploymentRequest | null {
  const deployment = getDeploymentById(deploymentId);

  if (!deployment || deployment.status !== "pending-approval" || !deployment.approvalRequestId) {
    return null;
  }

  const approval = denyApproval(deployment.approvalRequestId, reviewedBy, reviewNote);

  if (!approval) {
    return null;
  }

  deployment.status = "failed";
  deployment.errorMessage = reviewNote ?? "Deployment rejected during governance review.";

  logDeploymentEvent({
    deploymentId,
    engineId: deployment.engineId,
    event: "failed",
    actor: reviewedBy,
    detail: deployment.errorMessage,
  });

  return deployment;
}

async function triggerVercelDeployment(
  deployment: DeploymentRequest
): Promise<Pick<DeploymentRequest, "vercelDeploymentId" | "deploymentUrl">> {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL ?? "PLACEHOLDER_VERCEL_HOOK_URL";

  // Placeholder mode lets local development exercise the workflow without
  // a live Vercel project or network call.
  if (hookUrl.startsWith("PLACEHOLDER_")) {
    return {
      vercelDeploymentId: `placeholder-${deployment.deploymentId}`,
      deploymentUrl: `https://placeholder.vercel.app/${deployment.engineId}/${deployment.version}`,
    };
  }

  const response = await fetch(hookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      engineId: deployment.engineId,
      version: deployment.version,
      environment: deployment.environment,
    }),
  });

  if (!response.ok) {
    throw new Error(`Vercel deploy hook failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    job?: { id?: string };
    url?: string;
  };

  return {
    vercelDeploymentId: payload.job?.id ?? `vercel-${deployment.deploymentId}`,
    deploymentUrl: payload.url,
  };
}

/**
 * Trigger the deployment after approval.
 * This function is server-side only and keeps placeholder behavior for now.
 */
export async function triggerDeploy(
  deploymentId: string,
  deployedBy: string
): Promise<DeploymentRequest | null> {
  const deployment = getDeploymentById(deploymentId);

  if (!deployment) {
    return null;
  }

  if (!isApproved(deploymentId)) {
    deployment.status = "failed";
    deployment.errorMessage = "Deployment cannot start before governance approval.";

    logDeploymentEvent({
      deploymentId,
      engineId: deployment.engineId,
      event: "failed",
      actor: deployedBy,
      detail: deployment.errorMessage,
    });

    return deployment;
  }

  deployment.status = "deploying";
  deployment.deployedBy = deployedBy;

  logDeploymentEvent({
    deploymentId,
    engineId: deployment.engineId,
    event: "deploying",
    actor: deployedBy,
    detail: "Deployment trigger started.",
  });

  try {
    const triggerResult = await triggerVercelDeployment(deployment);

    deployment.status = "deployed";
    deployment.deployedAt = new Date().toISOString();
    deployment.vercelDeploymentId = triggerResult.vercelDeploymentId;
    deployment.deploymentUrl = triggerResult.deploymentUrl;

    logDeploymentEvent({
      deploymentId,
      engineId: deployment.engineId,
      event: "deployed",
      actor: deployedBy,
      detail: `Deployment completed with Vercel ID ${deployment.vercelDeploymentId}.`,
    });
  } catch (error) {
    deployment.status = "failed";
    deployment.errorMessage = error instanceof Error ? error.message : String(error);

    logDeploymentEvent({
      deploymentId,
      engineId: deployment.engineId,
      event: "failed",
      actor: deployedBy,
      detail: deployment.errorMessage,
    });
  }

  return deployment;
}

/**
 * Mark a deployment as rolled back and create a new request that points to
 * the target version.
 */
export function rollbackDeployment(
  currentDeploymentId: string,
  targetDeploymentId: string,
  rolledBackBy: string
): DeploymentRequest | null {
  const current = getDeploymentById(currentDeploymentId);
  const target = getDeploymentById(targetDeploymentId);

  if (!current || !target) {
    return null;
  }

  current.status = "rolled-back";

  logDeploymentEvent({
    deploymentId: current.deploymentId,
    engineId: current.engineId,
    event: "rolled-back",
    actor: rolledBackBy,
    detail: `Rolled back to deployment ${targetDeploymentId}.`,
  });

  return createDeploymentRequest({
    engineId: current.engineId,
    version: target.version,
    environment: current.environment,
    requestedBy: rolledBackBy,
    rollbackTargetId: targetDeploymentId,
  });
}

/**
 * List deployments for one engine in newest-first order.
 */
export function getDeploymentsForEngine(engineId: EngineId): DeploymentRequest[] {
  return deploymentStore
    .filter((deployment) => deployment.engineId === engineId)
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt));
}

/**
 * Return the latest successful deployment for an engine/environment pair.
 */
export function getLatestDeployment(
  engineId: EngineId,
  environment: DeploymentEnvironment
): DeploymentRequest | null {
  return (
    deploymentStore
      .filter(
        (deployment) =>
          deployment.engineId === engineId &&
          deployment.environment === environment &&
          deployment.status === "deployed" &&
          Boolean(deployment.deployedAt)
      )
      .sort((left, right) =>
        (right.deployedAt ?? "").localeCompare(left.deployedAt ?? "")
      )[0] ?? null
  );
}
