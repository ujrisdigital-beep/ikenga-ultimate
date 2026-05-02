// POST /api/auth/logout — clears session cookie

import { clearSessionCookie } from "../../../../src/ikenga/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  await clearSessionCookie();
  return Response.json({ success: true });
}
