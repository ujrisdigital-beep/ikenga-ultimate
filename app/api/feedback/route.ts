// POST /api/feedback — thumbs up or down on a content item

import { supabase } from "../../../src/ikenga/lib/supabase";
import { getSessionEmail } from "../../../src/ikenga/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) return Response.json({ error: "Not logged in." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const itemId  = typeof body.itemId  === "string" ? body.itemId  : "";
  const signal  = typeof body.signal  === "string" ? body.signal  : "";
  const product = typeof body.product === "string" ? body.product : "IKENGA";

  if (!itemId || !["up", "down"].includes(signal)) {
    return Response.json({ error: "itemId and signal ('up'|'down') are required." }, { status: 400 });
  }

  // Upsert so user can change their vote
  const { error } = await supabase
    .from("content_feedback")
    .upsert({ email, item_id: itemId, product, signal }, { onConflict: "email,item_id" });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  void supabase.from("user_events").insert({ email, event: "feedback", product, metadata: { item_id: itemId, signal } });

  return Response.json({ success: true, signal });
}
