// ============================================================
// POST /api/products/generate
// Product-aware generation — injects product voice into engine.
// Saves all individual content items to content_items table.
// Requires session cookie.
// ============================================================

import { supabase } from "../../../../src/ikenga/lib/supabase";
import { getSessionEmail } from "../../../../src/ikenga/lib/session";
import {
  generateIkengaContent,
  normalizeIkengaGenerationInput,
} from "../../../../src/ikenga/content/ikengaGenerator";
import { getProduct, type ProductId } from "../../../../src/ikenga/products/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Helpers ──────────────────────────────────────────────────

function scoreQuality(text: string): string {
  const len = (text ?? "").trim().length;
  if (len > 300) return "A";
  if (len > 150) return "B";
  if (len > 60)  return "C";
  return "D";
}

interface GeneratedPack {
  socialPosts?:   { day?: number; platform?: string; hook?: string; body?: string; cta?: string; hashtags?: string[] }[];
  videoScripts?:  { day?: number; platform?: string; title?: string; hook?: string; script?: string; cta?: string }[];
  emails?:        { day?: number; subject?: string; preview?: string; body?: string; cta?: string }[];
  ads?:           { platform?: string; headline?: string; body?: string; cta?: string }[];
  executionNotes?: string[];
}

type ContentItemInsert = {
  email: string; product: string; content_type: string;
  title: string; body: string; platform?: string | null;
  day?: number | null; quality: string; metadata: unknown;
};

function packToItems(pack: GeneratedPack, email: string, product: string): ContentItemInsert[] {
  const items: { email: string; product: string; content_type: string; title: string; body: string; platform?: string | null; day?: number | null; quality: string; metadata: unknown }[] = [];

  (pack.socialPosts ?? []).forEach(p => {
    const body = [p.hook, p.body, p.cta].filter(Boolean).join("\n\n");
    items.push({ email, product, content_type: "social_post", title: p.hook ?? "Social post", body, platform: p.platform ?? null, day: p.day ?? null, quality: scoreQuality(body), metadata: { hashtags: p.hashtags ?? [] } });
  });

  (pack.videoScripts ?? []).forEach(v => {
    const body = [v.hook, v.script, v.cta].filter(Boolean).join("\n\n");
    items.push({ email, product, content_type: "video_script", title: v.title ?? "Video script", body, platform: v.platform ?? null, day: v.day ?? null, quality: scoreQuality(body), metadata: {} });
  });

  (pack.emails ?? []).forEach(e => {
    const body = [e.preview, e.body, e.cta].filter(Boolean).join("\n\n");
    items.push({ email, product, content_type: "email", title: e.subject ?? "Email", body, platform: null, day: e.day ?? null, quality: scoreQuality(body), metadata: {} });
  });

  (pack.ads ?? []).forEach(a => {
    const body = [a.headline, a.body, a.cta].filter(Boolean).join("\n\n");
    items.push({ email, product, content_type: "ad", title: a.headline ?? "Ad", body, platform: a.platform ?? null, day: null, quality: scoreQuality(body), metadata: {} });
  });

  return items;
}

// ── Route ─────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  const email = await getSessionEmail();
  if (!email) return Response.json({ error: "Not logged in." }, { status: 401 });

  // Fetch profile
  const { data: profile, error: profileErr } = await supabase
    .from("user_profiles")
    .select("tier, pro_type, pro_expires, gens_used, bonus_gens, active_product")
    .eq("email", email)
    .maybeSingle();

  if (profileErr || !profile) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  // Check tier
  let tier = profile.tier as string;
  if (tier === "pro" && profile.pro_type === "monthly" && profile.pro_expires) {
    if (new Date(profile.pro_expires) < new Date()) tier = "free";
  }

  const totalFreeGens = 3 + (profile.bonus_gens ?? 0);
  if (tier === "free" && profile.gens_used >= totalFreeGens) {
    return Response.json({
      error: "Free tier limit reached.",
      message: `You have used all ${totalFreeGens} free generations. Upgrade to Pro to continue.`,
      upgradeUrl: "/pay",
    }, { status: 402 });
  }

  // Parse body
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const productId  = (typeof body.product  === "string" ? body.product  : profile.active_product) as ProductId;
  const brand      =  typeof body.brand    === "string" ? body.brand.trim()    : "";
  const goals      =  typeof body.goals    === "string" ? body.goals.trim()    : "";

  if (!brand || !goals) return Response.json({ error: "brand and goals are required." }, { status: 400 });

  const product = getProduct(productId);

  // Update active product on profile (non-blocking)
  void supabase.from("user_profiles").update({ active_product: productId }).eq("email", email);

  // Log generation start
  void supabase.from("generation_logs").insert({ email, label: `Generation started — ${productId} · ${brand.slice(0,40)}`, product: productId });
  void supabase.from("user_events").insert({ email, event: "generate", product: productId, metadata: { brand: brand.slice(0,40) } });

  // Build input — inject product tone and directive
  const input = normalizeIkengaGenerationInput({
    brand,
    goals,
    niche:    typeof body.niche    === "string" ? body.niche    : undefined,
    audience: typeof body.audience === "string" ? body.audience : undefined,
    offer:    typeof body.offer    === "string" ? body.offer    : undefined,
    website:  typeof body.website  === "string" ? body.website  : undefined,
    tone:     product.tone + (typeof body.tone === "string" && body.tone ? `, ${body.tone}` : ""),
    notes:    `PRODUCT VOICE DIRECTIVE: ${product.toneDirective}${typeof body.notes === "string" && body.notes ? `\n\nAdditional notes: ${body.notes}` : ""}`,
    contentPillars: [],
    callsToAction:  [],
  });

  // Run generation
  let result;
  try {
    result = await generateIkengaContent(input);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }

  // Increment gens_used
  await supabase.from("user_profiles").update({ gens_used: profile.gens_used + 1 }).eq("email", email);

  // Save individual content items
  const pack = result.output as GeneratedPack;
  const items = packToItems(pack, email, productId);

  if (items.length > 0) {
    void supabase.from("content_items").insert(items);
  }

  // Log completion
  void supabase.from("generation_logs").insert({
    email, label: `Generation complete — ${productId} · ${items.length} items · ${tier === "free" ? `${profile.gens_used + 1}/${totalFreeGens} free` : "Pro"}`, product: productId,
  });

  // Update streak
  const today = new Date().toISOString().split("T")[0];
  void supabase.from("user_profiles").update({ last_active: today }).eq("email", email);

  return Response.json({
    success: true,
    product: productId,
    content: pack,
    itemsSaved: items.length,
    gensUsed: profile.gens_used + 1,
    tier,
  });
}
