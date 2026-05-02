// ============================================================
// GET  /api/referral      — get my referral code + stats
// POST /api/referral/use  — redeem a referral code (on first gen)
// ============================================================

import { supabase } from "../../../src/ikenga/lib/supabase";
import { getSessionEmail } from "../../../src/ikenga/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) return Response.json({ error: "Not logged in." }, { status: 401 });

  const { data } = await supabase
    .from("onboarding_progress")
    .select("referral_code, referred_by")
    .eq("email", email)
    .maybeSingle();

  const { data: codeData } = await supabase
    .from("referral_codes")
    .select("code, uses")
    .eq("owner", email)
    .maybeSingle();

  return Response.json({
    code:       data?.referral_code ?? null,
    referredBy: data?.referred_by   ?? null,
    uses:       codeData?.uses      ?? 0,
    shareUrl:   `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ikenga-mvp.vercel.app"}/?ref=${data?.referral_code ?? ""}`,
  });
}

export async function POST(request: Request): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) return Response.json({ error: "Not logged in." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) return Response.json({ error: "code is required." }, { status: 400 });

  // Find the code
  const { data: codeRow } = await supabase
    .from("referral_codes")
    .select("code, owner, uses")
    .eq("code", code)
    .maybeSingle();

  if (!codeRow) return Response.json({ error: "Invalid referral code." }, { status: 404 });
  if (codeRow.owner === email) return Response.json({ error: "Cannot use your own code." }, { status: 400 });

  // Check not already used by this user
  const { data: existing } = await supabase
    .from("onboarding_progress")
    .select("referred_by")
    .eq("email", email)
    .maybeSingle();

  if (existing?.referred_by) return Response.json({ error: "You have already used a referral code." }, { status: 409 });

  // Credit both parties +3 bonus gens
  await supabase.from("onboarding_progress").update({ referred_by: codeRow.owner }).eq("email", email);
  await supabase.from("referral_codes").update({ uses: (codeRow.uses ?? 0) + 1 }).eq("code", code);

  // +3 bonus gens for both
  const updates = [email, codeRow.owner].map(e =>
    supabase.from("user_profiles")
      .select("bonus_gens")
      .eq("email", e)
      .maybeSingle()
      .then(({ data }) =>
        supabase.from("user_profiles")
          .update({ bonus_gens: (data?.bonus_gens ?? 0) + 3 })
          .eq("email", e)
      )
  );
  await Promise.all(updates);

  void supabase.from("user_events").insert({ email, event: "referral_used", metadata: { code, owner: codeRow.owner } });

  return Response.json({ success: true, bonusGens: 3 });
}
