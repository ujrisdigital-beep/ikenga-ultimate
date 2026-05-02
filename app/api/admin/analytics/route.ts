// ============================================================
// GET /api/admin/analytics
// Protected by IKENGA_ADMIN_API_TOKEN.
// Returns funnel metrics, top content types, product usage.
// ============================================================

import { timingSafeEqual } from "crypto";
import { supabase } from "../../../../src/ikenga/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkAdmin(request: Request): Response | null {
  const envToken = process.env.IKENGA_ADMIN_API_TOKEN?.trim();
  if (!envToken) return Response.json({ error: "Admin API disabled." }, { status: 503 });
  const submitted = request.headers.get("x-admin-token") ?? new URL(request.url).searchParams.get("token") ?? "";
  if (submitted.length !== envToken.length) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!timingSafeEqual(Buffer.from(envToken), Buffer.from(submitted))) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return null;
}

export async function GET(request: Request): Promise<Response> {
  const denied = checkAdmin(request);
  if (denied) return denied;

  // Run all queries in parallel
  const [
    usersRes,
    proRes,
    gensRes,
    signupsRes,
    eventsRes,
    contentTypesRes,
    productUsageRes,
    feedbackRes,
    streakRes,
  ] = await Promise.all([
    supabase.from("user_profiles").select("email", { count: "exact" }),
    supabase.from("user_profiles").select("email", { count: "exact" }).eq("tier", "pro"),
    supabase.from("generation_logs").select("email", { count: "exact" }),
    supabase.from("waitlist_signups").select("email", { count: "exact" }),
    supabase.from("user_events").select("event, product, created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("content_items").select("content_type").limit(500),
    supabase.from("generation_logs").select("product").limit(500),
    supabase.from("content_feedback").select("signal, product").limit(500),
    supabase.from("user_profiles").select("streak_days").order("streak_days", { ascending: false }).limit(10),
  ]);

  // Aggregate content types
  const typeCount: Record<string, number> = {};
  (contentTypesRes.data ?? []).forEach(r => {
    typeCount[r.content_type] = (typeCount[r.content_type] ?? 0) + 1;
  });

  // Aggregate product usage
  const productCount: Record<string, number> = {};
  (productUsageRes.data ?? []).forEach(r => {
    const p = r.product ?? "IKENGA";
    productCount[p] = (productCount[p] ?? 0) + 1;
  });

  // Aggregate feedback
  let upvotes = 0, downvotes = 0;
  const feedbackByProduct: Record<string, { up: number; down: number }> = {};
  (feedbackRes.data ?? []).forEach(r => {
    if (r.signal === "up") upvotes++; else downvotes++;
    const p = r.product ?? "IKENGA";
    if (!feedbackByProduct[p]) feedbackByProduct[p] = { up: 0, down: 0 };
    if (r.signal === "up") feedbackByProduct[p].up++; else feedbackByProduct[p].down++;
  });

  // Funnel: signups → profiles → first gen
  const funnel = {
    signups:     signupsRes.count  ?? 0,
    dashboardUsers: usersRes.count  ?? 0,
    generatedAtLeastOnce: gensRes.count  ?? 0,
    proUsers:    proRes.count      ?? 0,
  };

  // Event frequency
  const eventCount: Record<string, number> = {};
  (eventsRes.data ?? []).forEach(r => {
    eventCount[r.event] = (eventCount[r.event] ?? 0) + 1;
  });

  return Response.json({
    funnel,
    topContentTypes: Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count })),
    productUsage: Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .map(([product, count]) => ({ product, count })),
    feedback: { upvotes, downvotes, byProduct: feedbackByProduct },
    eventFrequency: Object.entries(eventCount).sort((a, b) => b[1] - a[1]),
    topStreaks: (streakRes.data ?? []).map(r => r.streak_days),
    conversionRate: funnel.signups > 0
      ? `${((funnel.proUsers / funnel.signups) * 100).toFixed(1)}%`
      : "0%",
  });
}
