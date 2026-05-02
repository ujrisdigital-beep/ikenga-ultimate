// ============================================================
// POST /api/payment/request
// Creates a payment request with a unique bank transfer reference.
// Requires active session cookie.
// ============================================================

import { supabase } from "../../../../src/ikenga/lib/supabase";
import { getSessionEmail } from "../../../../src/ikenga/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIER_AMOUNTS: Record<string, number> = {
  monthly:  19,
  lifetime: 49,
};

function generateRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  let ref = "IKG-";
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  // Add date suffix MMDD
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  ref += `-${mm}${dd}`;
  return ref;
}

export async function POST(request: Request): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) {
    return Response.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const tierType = typeof body.tierType === "string" ? body.tierType.trim() : "";
  if (!TIER_AMOUNTS[tierType]) {
    return Response.json(
      { error: "tierType must be 'monthly' or 'lifetime'." },
      { status: 400 }
    );
  }

  const amountGbp = TIER_AMOUNTS[tierType];

  // Check for existing pending request
  const { data: existing } = await supabase
    .from("payment_requests")
    .select("unique_ref, status")
    .eq("email", email)
    .eq("tier_type", tierType)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return Response.json({
      success: true,
      uniqueRef: existing.unique_ref,
      tierType,
      amountGbp,
      existing: true,
    });
  }

  // Generate unique ref with collision retry
  let uniqueRef = generateRef();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: clash } = await supabase
      .from("payment_requests")
      .select("id")
      .eq("unique_ref", uniqueRef)
      .maybeSingle();
    if (!clash) break;
    uniqueRef = generateRef();
  }

  const { error } = await supabase.from("payment_requests").insert({
    email,
    unique_ref: uniqueRef,
    tier_type: tierType,
    amount_gbp: amountGbp,
    status: "pending",
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await supabase.from("generation_logs").insert({
    email,
    label: `Payment requested — ${tierType === "lifetime" ? "£49 lifetime" : "£19/month"} (ref: ${uniqueRef})`,
  });

  return Response.json({ success: true, uniqueRef, tierType, amountGbp });
}
