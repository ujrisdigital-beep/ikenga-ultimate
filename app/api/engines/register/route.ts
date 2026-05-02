// ============================================================
// API ROUTE - /api/engines/register
// Phase 7 engine registration endpoint.
// - POST with `engineId` registers one engine
// - POST without `engineId` seeds all engines
// ============================================================

import { getEngineById, listEngines } from "../../../../src/ikenga/engines/engineRegistry";
import { registerAllEngines, registerEngine } from "../../../../src/ikenga/engines/registerEngine";
import type { EngineId } from "../../../../src/ikenga/engines/engineTypes";
import { persistEngineAudit } from "../../../../src/ikenga/api/persistEngineAudit";
import { requireAdminApiAccess } from "../../../../src/ikenga/lib/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const authError = requireAdminApiAccess(request);
  if (authError) {
    return authError;
  }

  let body: { engineId?: unknown; registeredBy?: unknown };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { engineId, registeredBy } = body;

  if (typeof registeredBy !== "string" || !registeredBy.trim()) {
    return Response.json({ error: "registeredBy is required." }, { status: 400 });
  }

  try {
    if (engineId === undefined) {
      const rows = await registerAllEngines();

      await persistEngineAudit({
        action: "engine.register",
        category: "engine",
        scope: "platform",
        actor: registeredBy,
        actorRole: "ikenga-os",
        actorTier: "os",
        payload: {
          registeredCount: rows.length,
          engineIds: listEngines().map((engine) => engine.id),
        },
      });

      return Response.json(
        { success: true, registeredCount: rows.length, engines: rows },
        { status: 201 }
      );
    }

    if (typeof engineId !== "string") {
      return Response.json({ error: "engineId must be a string when provided." }, { status: 400 });
    }

    const engine = getEngineById(engineId as EngineId);

    if (!engine) {
      return Response.json({ error: "Invalid or unknown engineId." }, { status: 400 });
    }

    const row = await registerEngine(engine);

    await persistEngineAudit({
      action: "engine.register",
      category: "engine",
      scope: "engine",
      scopeId: row.id,
      actor: registeredBy,
      actorRole: "ikenga-os",
      actorTier: "os",
      engineId: row.id,
      targetId: row.id,
      payload: { name: row.name, category: row.category },
    });

    return Response.json({ success: true, engine: row }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
