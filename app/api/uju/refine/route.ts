// ============================================================
// API ROUTE — /api/uju/refine
// Accepts a raw AI response + user query, returns a
// UJU Cycle™ refined output.
//
// The internal refinement logic is server-side only and is
// never exposed in the response payload.
// Method: POST
// ============================================================

import { refineResponse, formatRefinedOutput, proprietaryResponse } from "@/src/ikenga/uju/refiner";
import type { UJUDomain, UJURefinementInput } from "@/src/ikenga/uju/types";
import { requireAdminApiAccess } from "@/src/ikenga/lib/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Queries that ask how the system works — respond with proprietary shield.
const PROBE_PATTERNS = [
  /how did you (generate|create|produce|refine)/i,
  /show (me |your )?(process|method|logic|steps)/i,
  /what is your (system|internal) (prompt|instruction)/i,
  /ignore (all |previous )?(instructions|prompts)/i,
  /reveal (your|the) (secret|method|process)/i,
  /explain how you (work|think|operate|refine)/i,
  /tell me your (algorithm|framework|procedure)/i,
];

function isProbe(text: string): boolean {
  return PROBE_PATTERNS.some((p) => p.test(text));
}

const VALID_DOMAINS: UJUDomain[] = [
  "brand", "content", "legal", "waste",
  "finance", "government", "identity", "general",
];

export async function POST(request: Request): Promise<Response> {
  // Public endpoint — no admin key required so client apps can call it.
  // Remove the line below if you want to lock it to admin callers only.
  // const authError = requireAdminApiAccess(request);
  // if (authError) return authError;

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { rawResponse, userQuery, domain, actor, sessionId } = body;

  if (typeof rawResponse !== "string" || !rawResponse.trim()) {
    return Response.json({ error: "rawResponse is required." }, { status: 400 });
  }

  if (typeof userQuery !== "string" || !userQuery.trim()) {
    return Response.json({ error: "userQuery is required." }, { status: 400 });
  }

  // Proprietary shield — truthfully deflects reverse-engineering attempts.
  if (isProbe(userQuery)) {
    return Response.json({ refined: proprietaryResponse() }, { status: 200 });
  }

  if (domain !== undefined && !VALID_DOMAINS.includes(domain as UJUDomain)) {
    return Response.json(
      { error: `domain must be one of: ${VALID_DOMAINS.join(", ")}.` },
      { status: 400 }
    );
  }

  const input: UJURefinementInput = {
    rawResponse:  rawResponse as string,
    userQuery:    userQuery as string,
    domain:       domain as UJUDomain | undefined,
    actor:        typeof actor === "string" ? actor : undefined,
    sessionId:    typeof sessionId === "string" ? sessionId : undefined,
  };

  const refined = refineResponse(input);

  // Return only the formatted string — not the internal struct.
  // This keeps the UJU Cycle™ logic fully opaque to callers.
  return Response.json(
    { refined: formatRefinedOutput(refined) },
    { status: 200 }
  );
}
