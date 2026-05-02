// POST /api/user-product — save user's active product selection

import { supabase } from "../../../src/ikenga/lib/supabase";
import { getSessionEmail } from "../../../src/ikenga/lib/session";
import { PRODUCT_IDS } from "../../../src/ikenga/products/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) return Response.json({ error: "Not logged in." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const product = typeof body.product === "string" ? body.product : "";
  if (!PRODUCT_IDS.includes(product as never)) {
    return Response.json({ error: "Invalid product." }, { status: 400 });
  }

  await supabase.from("user_profiles").update({ active_product: product }).eq("email", email);
  void supabase.from("user_events").insert({ email, event: "product_switch", product });

  return Response.json({ success: true, product });
}
