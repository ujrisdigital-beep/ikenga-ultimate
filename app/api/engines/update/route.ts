// ============================================================
// API ROUTE - /api/engines/update
// Phase 7 engine update endpoint for mutable registry fields.
// Method: PATCH or PUT
// ============================================================

import { supabase } from "../../../../src/ikenga/lib/supabase";
import { getEngineById } from "../../../../src/ikenga/engines/engineRegistry";
import type {
  EngineCategory,
  EngineId,
  EngineStatus,
} from "../../../../src/ikenga/engines/engineTypes";
import { persistEngineAudit } from "../../../../src/ikenga/api/persistEngineAudit";
import { requireAdminApiAccess } from "../../../../src/ikenga/lib/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UpdateBody {
  engineId?: unknown;
  updatedBy?: unknown;
  status?: unknown;
  description?: unknown;
  path?: unknown;
  category?: unknown;
  apiKeyEnvVar?: unknown;
  apiKeyPlaceholder?: unknown;
}

const VALID_STATUSES: EngineStatus[] = ["active", "inactive", "maintenance"];
const VALID_CATEGORIES: EngineCategory[] = [
  "operating-system",
  "operations",
  "evidence",
  "identity",
  "commerce",
  "intelligence",
  "finance",
  "government",
];

async function updateEngine(request: Request): Promise<Response> {
  const authError = requireAdminApiAccess(request);
  if (authError) {
    return authError;
  }

  let body: UpdateBody;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    engineId,
    updatedBy,
    status,
    description,
    path,
    category,
    apiKeyEnvVar,
    apiKeyPlaceholder,
  } = body;

  if (typeof engineId !== "string" || !getEngineById(engineId as EngineId)) {
    return Response.json({ error: "Invalid or unknown engineId." }, { status: 400 });
  }

  if (typeof updatedBy !== "string" || !updatedBy.trim()) {
    return Response.json({ error: "updatedBy is required." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (status !== undefined) {
    if (typeof status !== "string" || !VALID_STATUSES.includes(status as EngineStatus)) {
      return Response.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}.` },
        { status: 400 }
      );
    }

    patch.status = status;
  }

  if (description !== undefined) {
    if (typeof description !== "string" || !description.trim()) {
      return Response.json({ error: "description must be a non-empty string." }, { status: 400 });
    }

    patch.description = description;
  }

  if (path !== undefined) {
    if (typeof path !== "string" || !path.startsWith("/engines/")) {
      return Response.json({ error: "path must start with /engines/." }, { status: 400 });
    }

    patch.path = path;
  }

  if (category !== undefined) {
    if (typeof category !== "string" || !VALID_CATEGORIES.includes(category as EngineCategory)) {
      return Response.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}.` },
        { status: 400 }
      );
    }

    patch.category = category;
  }

  if (apiKeyEnvVar !== undefined) {
    if (typeof apiKeyEnvVar !== "string" || !apiKeyEnvVar.trim()) {
      return Response.json({ error: "apiKeyEnvVar must be a non-empty string." }, { status: 400 });
    }

    patch.api_key_env_var = apiKeyEnvVar;
  }

  if (apiKeyPlaceholder !== undefined) {
    if (typeof apiKeyPlaceholder !== "string" || !apiKeyPlaceholder.trim()) {
      return Response.json(
        { error: "apiKeyPlaceholder must be a non-empty string." },
        { status: 400 }
      );
    }

    patch.api_key_placeholder = apiKeyPlaceholder;
  }

  const { data, error } = await supabase
    .from("engines")
    .update(patch)
    .eq("id", engineId)
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
      actor: updatedBy,
      actorRole: "ikenga-os",
      actorTier: "os",
      engineId: engineId as EngineId,
      targetId: engineId,
      payload: patch,
    });
  } catch (auditError) {
    const message = auditError instanceof Error ? auditError.message : String(auditError);
    return Response.json(
      { success: true, engine: data, warning: `Engine updated, but audit persistence failed: ${message}` },
      { status: 200 }
    );
  }

  return Response.json({ success: true, engine: data }, { status: 200 });
}

export const PUT = updateEngine;
export const PATCH = updateEngine;
