// ============================================================
// API ROUTE - /api/engines/deploy
// Phase 7 deployment endpoint.
// Creates a deployment request, runs the deployment workflow,
// persists the deployment row, and mirrors audit entries.
// ============================================================

import { deployEngine } from "../../../../src/ikenga/api/deployEngine";
import { persistEngineAudit } from "../../../../src/ikenga/api/persistEngineAudit";
import type { EngineId as GovernanceEngineId, SemVer } from "../../../../src/ikenga/engine_types";
import { getEngineById } from "../../../../src/ikenga/engines/engineRegistry";
import type { EngineId } from "../../../../src/ikenga/engines/engineTypes";
import { requireAdminApiAccess } from "../../../../src/ikenga/lib/adminApi";
import { supabase } from "../../../../src/ikenga/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_ENVS = ["development", "staging", "production"] as const;
type DeploymentEnvironment = (typeof VALID_ENVS)[number];

export async function POST(request: Request): Promise<Response> {
  const authError = requireAdminApiAccess(request);
  if (authError) {
    return authError;
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { engineId, version, environment, requestedBy, autoDeploy } = body;

  if (typeof engineId !== "string" || !getEngineById(engineId as EngineId)) {
    return Response.json({ error: "Invalid or unknown engineId." }, { status: 400 });
  }

  if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) {
    return Response.json({ error: "version must be a semver string (e.g. 1.0.0)." }, { status: 400 });
  }

  if (typeof environment !== "string" || !VALID_ENVS.includes(environment as DeploymentEnvironment)) {
    return Response.json(
      { error: `environment must be one of: ${VALID_ENVS.join(", ")}.` },
      { status: 400 }
    );
  }

  if (typeof requestedBy !== "string" || !requestedBy.trim()) {
    return Response.json({ error: "requestedBy is required." }, { status: 400 });
  }

  const result = await deployEngine({
    engineId: engineId as GovernanceEngineId,
    version: version as SemVer,
    environment: environment as DeploymentEnvironment,
    requestedBy,
    autoDeploy: autoDeploy === true,
  });

  if (!result.deployment) {
    return Response.json({ error: result.message }, { status: 500 });
  }

  const deployment = result.deployment;

  const { error: dbError } = await supabase.from("engine_deployments").upsert(
    {
      id: deployment.deploymentId,
      engine_id: deployment.engineId,
      version: deployment.version,
      environment: deployment.environment,
      status: deployment.status,
      requested_by: deployment.requestedBy,
      requested_at: deployment.requestedAt,
      approval_request_id: deployment.approvalRequestId ?? null,
      approved_by: deployment.approvedBy ?? null,
      approved_at: deployment.approvedAt ?? null,
      deployed_at: deployment.deployedAt ?? null,
      deployed_by: deployment.deployedBy ?? null,
      rollback_target_id: deployment.rollbackTargetId ?? null,
      vercel_deployment_id: deployment.vercelDeploymentId ?? null,
      deployment_url: deployment.deploymentUrl ?? null,
      error_message: deployment.errorMessage ?? null,
    },
    { onConflict: "id" }
  );

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 });
  }

  try {
    await persistEngineAudit({
      action: "deployment.request",
      category: "deployment",
      scope: "deployment",
      scopeId: deployment.deploymentId,
      actor: requestedBy,
      actorRole: "ikenga-os",
      actorTier: "os",
      engineId: deployment.engineId as GovernanceEngineId,
      targetId: deployment.deploymentId,
      payload: {
        environment: deployment.environment,
        version: deployment.version,
        status: deployment.status,
      },
    });

    if (deployment.status === "deployed") {
      await persistEngineAudit({
        action: "deployment.complete",
        category: "deployment",
        scope: "deployment",
        scopeId: deployment.deploymentId,
        actor: requestedBy,
        actorRole: "ikenga-os",
        actorTier: "os",
        engineId: deployment.engineId as GovernanceEngineId,
        targetId: deployment.deploymentId,
        payload: {
          vercelDeploymentId: deployment.vercelDeploymentId,
          deploymentUrl: deployment.deploymentUrl,
        },
      });
    }

    if (deployment.status === "failed") {
      await persistEngineAudit({
        action: "deployment.fail",
        category: "deployment",
        scope: "deployment",
        scopeId: deployment.deploymentId,
        actor: requestedBy,
        actorRole: "ikenga-os",
        actorTier: "os",
        engineId: deployment.engineId as GovernanceEngineId,
        targetId: deployment.deploymentId,
        outcome: "failure",
        payload: { errorMessage: deployment.errorMessage ?? "Unknown deployment error." },
      });
    }
  } catch (auditError) {
    const message = auditError instanceof Error ? auditError.message : String(auditError);
    return Response.json(
      {
        success: result.success,
        deployment,
        message: result.message,
        warning: `Deployment persisted, but audit persistence failed: ${message}`,
      },
      { status: result.success ? 202 : 500 }
    );
  }

  return Response.json(
    { success: result.success, deployment, message: result.message },
    { status: result.success ? 202 : 500 }
  );
}
