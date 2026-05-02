// ============================================================
// IKENGA API - DEPLOY ENGINE
// Server-side deployment orchestration helper for Phase 4.
// This utility creates deployment requests, routes them through
// governance approval, optionally auto-approves development
// deploys, and triggers the server-side deployment stub.
// ============================================================

import type { EngineId, SemVer } from "../engine_types";
import {
  approveDeploymentRequest,
  createDeploymentRequest,
  submitDeploymentForApproval,
  triggerDeploy,
  type DeploymentEnvironment,
  type DeploymentRequest,
} from "../governance/deployments";

export interface DeployEngineInput {
  engineId: EngineId;
  version: SemVer;
  environment: DeploymentEnvironment;
  requestedBy: string;
  autoDeploy?: boolean;
}

export interface DeployEngineResult {
  success: boolean;
  deployment: DeploymentRequest | null;
  message: string;
}

/**
 * Create, submit, optionally approve, and optionally trigger a deployment.
 */
export async function deployEngine(
  input: DeployEngineInput
): Promise<DeployEngineResult> {
  const deployment = createDeploymentRequest({
    engineId: input.engineId,
    version: input.version,
    environment: input.environment,
    requestedBy: input.requestedBy,
  });

  const submitted = submitDeploymentForApproval(deployment.deploymentId);

  if (!submitted) {
    return {
      success: false,
      deployment,
      message: "Failed to submit deployment for governance approval.",
    };
  }

  if (!input.autoDeploy) {
    return {
      success: true,
      deployment: submitted,
      message: `Deployment request submitted and awaiting approval (${submitted.approvalRequestId}).`,
    };
  }

  if (input.environment !== "development") {
    return {
      success: false,
      deployment: submitted,
      message: "Auto-deploy is allowed only for the development environment.",
    };
  }

  const approved = approveDeploymentRequest(
    deployment.deploymentId,
    input.requestedBy,
    "Auto-approved for development deployment."
  );

  if (!approved) {
    return {
      success: false,
      deployment: submitted,
      message: "Failed to auto-approve the development deployment.",
    };
  }

  const triggered = await triggerDeploy(deployment.deploymentId, input.requestedBy);
  const success = triggered?.status === "deployed";

  return {
    success,
    deployment: triggered,
    message: success
      ? `Engine '${input.engineId}' deployed to ${input.environment}.`
      : `Deployment failed: ${triggered?.errorMessage ?? "unknown error"}`,
  };
}
