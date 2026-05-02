// ============================================================
// POST /api/generate
// User-facing content generation — gated by tier.
// Free:  3 lifetime generations.
// Pro:   unlimited.
// Requires active session cookie.
// ============================================================

import { supabase } from "../../../src/ikenga/lib/supabase";
import { getSessionEmail } from "../../../src/ikenga/lib/session";
import {
  generateIkengaContent,
  normalizeIkengaGenerationInput,
} from "../../../src/ikenga/content/ikengaGenerator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) {
    return Response.json({ error: "Not logged in." }, { status: 401 });
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tier, pro_type, pro_expires, gens_used")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  // Check tier and expiry
  let tier = profile.tier as string;
  if (tier === "pro" && profile.pro_type === "monthly" && profile.pro_expires) {
    if (new Date(profile.pro_expires) < new Date()) tier = "free";
  }

  // Enforce free tier limit
  if (tier === "free" && profile.gens_used >= 3) {
    return Response.json(
      {
        error: "Free tier limit reached.",
        message:
          "You have used your 3 free generations. Upgrade to Pro (£19/month or £49 lifetime) to continue.",
        upgradeUrl: "/pay",
      },
      { status: 402 }
    );
  }

  // Parse request body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const brand  = typeof body.brand  === "string" ? body.brand.trim()  : "";
  const goals  = typeof body.goals  === "string" ? body.goals.trim()  : "";

  if (!brand || !goals) {
    return Response.json({ error: "brand and goals are required." }, { status: 400 });
  }

  // Log the generation start
  await supabase.from("generation_logs").insert({
    email,
    label: `Content generation started — brand: ${brand.slice(0, 40)}`,
  });

  // Run generation
  let result;
  try {
    result = await generateIkengaContent(
      normalizeIkengaGenerationInput({
        brand,
        goals,
        niche:          typeof body.niche          === "string" ? body.niche          : undefined,
        audience:       typeof body.audience       === "string" ? body.audience       : undefined,
        offer:          typeof body.offer          === "string" ? body.offer          : undefined,
        tone:           typeof body.tone           === "string" ? body.tone           : undefined,
        website:        typeof body.website        === "string" ? body.website        : undefined,
        contentPillars: Array.isArray(body.contentPillars) ? body.contentPillars : [],
        callsToAction:  Array.isArray(body.callsToAction)  ? body.callsToAction  : [],
        notes:          typeof body.notes          === "string" ? body.notes          : undefined,
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }

  // Increment gens_used and log completion
  await supabase
    .from("user_profiles")
    .update({ gens_used: profile.gens_used + 1 })
    .eq("email", email);

  await supabase.from("generation_logs").insert({
    email,
    label: `Content generation complete — ${tier === "free" ? `${profile.gens_used + 1}/3 free used` : "Pro account"}`,
  });

  return Response.json({
    success: true,
    content: result.output,
    gensUsed: profile.gens_used + 1,
    tier,
  });
}
