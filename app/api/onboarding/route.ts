// ============================================================
// GET  /api/onboarding — get user's onboarding state
// POST /api/onboarding — advance to next step
// ============================================================

import { supabase } from "../../../src/ikenga/lib/supabase";
import { getSessionEmail } from "../../../src/ikenga/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function genReferralCode(email: string): string {
  const hash = email.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "IK";
  let seed = hash;
  for (let i = 0; i < 5; i++) {
    code += chars[seed % chars.length];
    seed = Math.floor(seed / chars.length) + i * 7;
  }
  return code;
}

export async function GET(): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) return Response.json({ error: "Not logged in." }, { status: 401 });

  const { data, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Auto-create if missing
  if (!data) {
    const referralCode = genReferralCode(email);
    const { data: created } = await supabase
      .from("onboarding_progress")
      .insert({ email, current_step: 1, referral_code: referralCode })
      .select()
      .single();
    return Response.json({ onboarding: created });
  }

  return Response.json({ onboarding: data });
}

export async function POST(request: Request): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) return Response.json({ error: "Not logged in." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const step = typeof body.step === "number" ? body.step : 0;
  if (!step || step < 1 || step > 7) {
    return Response.json({ error: "step must be 1–7." }, { status: 400 });
  }

  // Fetch current state
  const { data } = await supabase
    .from("onboarding_progress")
    .select("current_step, completed_days")
    .eq("email", email)
    .maybeSingle();

  const completedDays = (data?.completed_days as Record<string, string>) ?? {};
  const now = new Date().toISOString();

  // Mark this step done
  completedDays[String(step)] = now;
  const nextStep = Math.max(data?.current_step ?? step, step + 1);

  await supabase
    .from("onboarding_progress")
    .upsert({
      email,
      current_step:   Math.min(nextStep, 7),
      completed_days: completedDays,
    }, { onConflict: "email" });

  // Day 4 bonus: +1 gen for sharing first post
  if (step === 4) {
    await supabase.from("user_profiles").update({ bonus_gens: 1 }).eq("email", email);
  }

  void supabase.from("user_events").insert({ email, event: "onboarding_step", metadata: { step } });

  return Response.json({ success: true, step, nextStep: Math.min(nextStep, 7) });
}
