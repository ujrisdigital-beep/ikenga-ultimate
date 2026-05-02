// ============================================================
// GET /api/dashboard
// Returns logged-in user's profile, generation count, and action log.
// Requires active session cookie.
// Resilient — returns a working default if DB tables don't exist yet.
// ============================================================

import { supabase } from "../../../src/ikenga/lib/supabase";
import { getSessionEmail } from "../../../src/ikenga/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) {
    return Response.json({ error: "Not logged in." }, { status: 401 });
  }

  // Fetch profile — tolerate table-not-found errors
  const { data: profile, error: profileErr } = await supabase
    .from("user_profiles")
    .select("email, display_name, tier, pro_type, pro_expires, gens_used, created_at")
    .eq("email", email)
    .maybeSingle();

  // If table doesn't exist yet, return a safe default so dashboard still loads
  if (profileErr) {
    console.warn("user_profiles read failed:", profileErr.message);
    return Response.json({
      email,
      displayName: null,
      tier: "free",
      proType: null,
      proExpires: null,
      gensUsed: 0,
      gensLimit: 3,
      memberSince: new Date().toISOString(),
      logs: [],
      pendingPayments: [],
      dbNotReady: true,
    });
  }

  // Profile row doesn't exist yet — auto-create it
  if (!profile) {
    await supabase
      .from("user_profiles")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

    return Response.json({
      email,
      displayName: null,
      tier: "free",
      proType: null,
      proExpires: null,
      gensUsed: 0,
      gensLimit: 3,
      memberSince: new Date().toISOString(),
      logs: [],
      pendingPayments: [],
    });
  }

  // Fetch last 20 action log entries
  const { data: logs } = await supabase
    .from("generation_logs")
    .select("id, label, created_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch payment requests
  const { data: pendingPayments } = await supabase
    .from("payment_requests")
    .select("unique_ref, tier_type, amount_gbp, status, created_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(5);

  // Check if monthly Pro has expired
  let tier = profile.tier as string;
  if (tier === "pro" && profile.pro_type === "monthly" && profile.pro_expires) {
    if (new Date(profile.pro_expires) < new Date()) {
      tier = "free";
      void supabase.from("user_profiles").update({ tier: "free" }).eq("email", email);
    }
  }

  return Response.json({
    email: profile.email,
    displayName: profile.display_name,
    tier,
    proType: profile.pro_type,
    proExpires: profile.pro_expires,
    gensUsed: profile.gens_used,
    gensLimit: tier === "pro" ? null : 3,
    memberSince: profile.created_at,
    logs: logs ?? [],
    pendingPayments: pendingPayments ?? [],
  });
}
