// ============================================================
// GET /api/bank-details
// Returns bank transfer details from environment variables.
// Falls back to hardcoded details if env vars are not set.
// Safe to call from client components.
// ============================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return Response.json({
    bankName:      process.env.BANK_NAME          ?? "REVOLUT",
    accountName:   process.env.BANK_ACCOUNT_NAME  ?? "ONYEDIKA MICHAEL OJIAKU",
    sortCode:      process.env.BANK_SORT_CODE      ?? "04-29-09",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "23989009",
  });
}
