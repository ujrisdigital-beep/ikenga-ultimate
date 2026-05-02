// ============================================================
// API ROUTE - /api/engines/audit
// Phase 7 audit log endpoint.
// Supports paging and filtering by engine, actor, category,
// scope, action, and time range.
// ============================================================

import { getEngineById } from "../../../../src/ikenga/engines/engineRegistry";
import type { EngineId } from "../../../../src/ikenga/engines/engineTypes";
import { requireAdminApiAccess } from "../../../../src/ikenga/lib/adminApi";
import { supabase } from "../../../../src/ikenga/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export async function GET(request: Request): Promise<Response> {
  const authError = requireAdminApiAccess(request);
  if (authError) {
    return authError;
  }

  const { searchParams } = new URL(request.url);

  const engineId = searchParams.get("engineId");
  const actor = searchParams.get("actor");
  const category = searchParams.get("category");
  const scope = searchParams.get("scope");
  const action = searchParams.get("action");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const parsedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);

  if (engineId && !getEngineById(engineId as EngineId)) {
    return Response.json({ error: "Invalid engineId." }, { status: 400 });
  }

  let query = supabase
    .from("engine_audit_logs")
    .select("*", { count: "exact" })
    .order("timestamp", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (engineId) query = query.eq("engine_id", engineId);
  if (actor) query = query.eq("actor", actor);
  if (category) query = query.eq("category", category);
  if (scope) query = query.eq("scope", scope);
  if (action) query = query.eq("action", action);
  if (from) query = query.gte("timestamp", from);
  if (to) query = query.lte("timestamp", to);

  const { data, error, count } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(
    {
      logs: data,
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    },
    { status: 200 }
  );
}
