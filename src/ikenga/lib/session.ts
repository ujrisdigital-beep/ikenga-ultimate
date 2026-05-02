// ============================================================
// IKENGA SESSION HELPERS
// Simple email-based session stored in an httpOnly cookie.
// Server-side only — never import in client components.
// ============================================================

import { cookies } from "next/headers";

const COOKIE_NAME = "ik_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ------------------------------------------------------------------
// Encode / decode  (base64 of email — MVP simplicity)
// ------------------------------------------------------------------

function encode(email: string): string {
  return Buffer.from(email.toLowerCase().trim()).toString("base64");
}

function decode(value: string): string | null {
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    return decoded.includes("@") ? decoded : null;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Public helpers
// ------------------------------------------------------------------

/** Read the session email from the request cookie header. */
export async function getSessionEmail(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return null;
  return decode(value);
}

/** Set the session cookie (call from a server action or route handler). */
export async function setSessionCookie(email: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, encode(email), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

/** Clear the session cookie. */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
