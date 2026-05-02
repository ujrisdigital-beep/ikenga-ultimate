// ============================================================
// API ROUTE - /api/engines/version
// Phase 7 version history endpoint.
// GET  - list version history for one engine
// POST - append a new version record
// ============================================================

import { getEngineById } from "../../../../src/ikenga/engines/engineRegistry";
import type { EngineId } from "../../../../src/ikenga/engines/engineTypes";
import { persistEngineAudit } from "../../../../src/ikenga/api/persistEngineAudit";
import { requireAdminApiAccess } from "../../../../src/ikenga/lib/adminApi";
import { supabase } from "../../../../src/ikenga/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const authError = requireAdminApiAccess(request);
  if (authError) {
    return authError;
  }

  const { searchParams } = new URL(request.url);
  const engineId = searchParams.get("engineId");

  if (!engineId || !getEngineById(engineId as EngineId)) {
    return Response.json({ error: "Invalid or missing engineId query parameter." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("engine_versions")
    .select("*")
    .eq("engine_id", engineId)
    .order("deployed_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ engineId, versions: data }, { status: 200 });
}

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

  const { engineId, version, changelog, deployedBy, parentVersion } = body;

  if (typeof engineId !== "string" || !getEngineById(engineId as EngineId)) {
    return Response.json({ error: "Invalid or unknown engineId." }, { status: 400 });
  }

  if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) {
    return Response.json({ error: "version must be a semver string (e.g. 1.2.0)." }, { status: 400 });
  }

  if (typeof changelog !== "string" || !changelog.trim()) {
    return Response.json({ error: "changelog is required." }, { status: 400 });
  }

  if (typeof deployedBy !== "string" || !deployedBy.trim()) {
    return Response.json({ error: "deployedBy is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("engine_versions")
    .insert({
      engine_id: engineId,
      version,
      changelog,
      deployed_by: deployedBy,
      parent_version: typeof parentVersion === "string" ? parentVersion : null,
      deployed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  try {
    await persistEngineAudit({
      action: "engine.update",
      category: "engine",
      scope: "engine",
      scopeId: engineId,
      actor: deployedBy,
      actorRole: "ikenga-os",
      actorTier: "os",
      engineId: engineId as EngineId,
      targetId: data.id,
      payload: {
        version,
        changelog,
        parentVersion: typeof parentVersion === "string" ? parentVersion : null,
      },
    });
  } catch (auditError) {
    const message = auditError instanceof Error ? auditError.message : String(auditError);
    return Response.json(
      {
        success: true,
        versionRecord: data,
        warning: `Version record created, but audit persistence failed: ${message}`,
      },
      { status: 201 }
    );
  }

  return Response.json({ success: true, versionRecord: data }, { status: 201 });
}
