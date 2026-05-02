// ============================================================
// DEBUG ENDPOINT — /api/debug/token
// TEMPORARY — DELETE AFTER TOKEN IS CONFIRMED WORKING
// Shows exactly what token the server has vs what was sent.
// ============================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const envToken = process.env.IKENGA_ADMIN_API_TOKEN ?? null;
  const authHeader = request.headers.get("authorization") ?? null;
  const submittedToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  return Response.json({
    env: {
      set: envToken !== null,
      length: envToken?.length ?? 0,
      first10: envToken?.slice(0, 10) ?? "NOT SET",
      last10: envToken?.slice(-10) ?? "NOT SET",
      full: envToken ?? "NOT SET",
    },
    submitted: {
      header_present: authHeader !== null,
      length: submittedToken?.length ?? 0,
      first10: submittedToken?.slice(0, 10) ?? "NOT SENT",
      last10: submittedToken?.slice(-10) ?? "NOT SENT",
      full: submittedToken ?? "NOT SENT",
    },
    match: envToken !== null && submittedToken !== null && envToken === submittedToken,
  });
}
