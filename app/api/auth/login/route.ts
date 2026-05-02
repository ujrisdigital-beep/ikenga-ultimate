// ============================================================
// POST /api/auth/login
// Email-based login — open to any valid email.
// Auto-enrolls in waitlist if not already there.
// Auto-creates user_profiles row on first login.
// ============================================================

import { supabase } from "../../../../src/ikenga/lib/supabase";
import { setSessionCookie } from "../../../../src/ikenga/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!raw || !EMAIL_RE.test(raw)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const displayName =
    typeof body.displayName === "string" && body.displayName.trim()
      ? body.displayName.trim()
      : null;

  // Auto-enroll in waitlist if not already there (non-blocking)
  void supabase
    .from("waitlist_signups")
    .upsert(
      { email: raw, source: "direct-login", status: "active" },
      { onConflict: "email", ignoreDuplicates: true }
    );

  // Upsert user_profiles — creates on first login, updates name if provided
  const { error: profileError } = await supabase
    .from("user_profiles")
    .upsert(
      { email: raw, ...(displayName ? { display_name: displayName } : {}) },
      { onConflict: "email", ignoreDuplicates: false }
    );

  // If tables don't exist yet (migration not run yet), still allow login
  if (profileError) {
    console.warn("user_profiles upsert failed:", profileError.message);
  }

  // Log the login (non-blocking)
  void supabase
    .from("generation_logs")
    .insert({ email: raw, label: "Logged in" });

  // Set session cookie
  await setSessionCookie(raw);

  return Response.json({ success: true, email: raw });
}
