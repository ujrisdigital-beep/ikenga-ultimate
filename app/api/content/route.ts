// ============================================================
// GET  /api/content  — fetch user's saved content items
// PATCH /api/content — mark as copied / published
// ============================================================

import { supabase } from "../../../src/ikenga/lib/supabase";
import { getSessionEmail } from "../../../src/ikenga/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) return Response.json({ error: "Not logged in." }, { status: 401 });

  const url      = new URL(request.url);
  const product  = url.searchParams.get("product")  ?? undefined;
  const type     = url.searchParams.get("type")     ?? undefined;
  const limitStr = url.searchParams.get("limit")    ?? "40";
  const limit    = Math.min(parseInt(limitStr, 10) || 40, 100);

  let q = supabase
    .from("content_items")
    .select("id, product, content_type, title, body, platform, day, quality, published, copied, metadata, created_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (product) q = q.eq("product", product);
  if (type)    q = q.eq("content_type", type);

  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ items: data ?? [] });
}

export async function PATCH(request: Request): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) return Response.json({ error: "Not logged in." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const id     = typeof body.id     === "string" ? body.id     : "";
  const field  = typeof body.field  === "string" ? body.field  : "";
  const value  = typeof body.value  === "boolean" ? body.value : true;

  if (!id || !["published", "copied"].includes(field)) {
    return Response.json({ error: "id and field ('published'|'copied') are required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("content_items")
    .update({ [field]: value })
    .eq("id", id)
    .eq("email", email); // owns it

  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (field === "copied") {
    void supabase.from("user_events").insert({ email, event: "copy", metadata: { item_id: id } });
  }

  return Response.json({ success: true });
}
