// ============================================================
// GET  /api/admin/payments          — list all payment requests
// POST /api/admin/payments          — confirm or reject a payment
// Protected by IKENGA_ADMIN_API_TOKEN header.
// ============================================================

import { timingSafeEqual } from "crypto";
import { supabase } from "../../../../src/ikenga/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkAdminToken(request: Request): Response | null {
  const envToken = process.env.IKENGA_ADMIN_API_TOKEN?.trim();
  if (!envToken) {
    return Response.json({ error: "Admin API disabled." }, { status: 503 });
  }

  const submitted =
    request.headers.get("x-admin-token") ??
    new URL(request.url).searchParams.get("token") ??
    "";

  if (submitted.length !== envToken.length) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const a = Buffer.from(envToken, "utf8");
  const b = Buffer.from(submitted, "utf8");
  if (!timingSafeEqual(a, b)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}

export async function GET(request: Request): Promise<Response> {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") ?? "pending";

  const { data, error } = await supabase
    .from("payment_requests")
    .select("id, email, unique_ref, tier_type, amount_gbp, status, admin_notes, created_at, confirmed_at")
    .eq("status", statusFilter)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ payments: data ?? [] });
}

export async function POST(request: Request): Promise<Response> {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const id     = typeof body.id     === "string" ? body.id.trim()     : "";
  const action = typeof body.action === "string" ? body.action.trim() : "";
  const notes  = typeof body.notes  === "string" ? body.notes.trim()  : null;

  if (!id || !["confirmed", "rejected"].includes(action)) {
    return Response.json(
      { error: "id and action ('confirmed'|'rejected') are required." },
      { status: 400 }
    );
  }

  // Fetch the request
  const { data: pr, error: fetchErr } = await supabase
    .from("payment_requests")
    .select("email, tier_type, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !pr) {
    return Response.json({ error: "Payment request not found." }, { status: 404 });
  }
  if (pr.status !== "pending") {
    return Response.json({ error: `Already ${pr.status}.` }, { status: 409 });
  }

  // Update the payment request
  const { error: updateErr } = await supabase
    .from("payment_requests")
    .update({
      status: action,
      admin_notes: notes,
      confirmed_at: action === "confirmed" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 });

  // If confirmed — upgrade the user's tier
  if (action === "confirmed") {
    const proType   = pr.tier_type as "monthly" | "lifetime";
    const proExpires =
      proType === "monthly"
        ? new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    await supabase
      .from("user_profiles")
      .update({ tier: "pro", pro_type: proType, pro_expires: proExpires })
      .eq("email", pr.email);

    // Log the upgrade
    await supabase.from("generation_logs").insert({
      email: pr.email,
      label: `Upgraded to Pro (${proType === "lifetime" ? "lifetime" : "monthly"}) — payment confirmed by admin`,
    });
  }

  return Response.json({ success: true, action, email: pr.email });
}
