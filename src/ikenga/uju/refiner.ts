// ============================================================
// UJU CYCLE™ REFINEMENT ENGINE
// Proprietary post-processing layer for IKENGA AI responses.
// Transforms raw AI output into structured, bankable actions.
//
// Process: U¹ (Extract) → J (Prioritise) → U² (Optimise)
//
// This module is server-side only. Never import in client
// components. The internal logic is not exposed via any API.
// ============================================================

import type {
  UJUDomain,
  UJURefinedOutput,
  UJURefinementInput,
} from "./types";

// ------------------------------------------------------------------
// Domain detection — infers domain from the user query.
// ------------------------------------------------------------------

const DOMAIN_SIGNALS: Record<UJUDomain, string[]> = {
  brand:      ["brand", "identity", "reputation", "positioning", "audience"],
  content:    ["content", "post", "caption", "thread", "publish", "write", "copy"],
  legal:      ["legal", "discrimination", "rights", "contract", "comply", "regulation", "SAR"],
  waste:      ["waste", "circular", "recycle", "sustainability", "material", "reuse"],
  finance:    ["payment", "invoice", "revenue", "budget", "finance", "banking", "ledger"],
  government: ["government", "ministry", "procurement", "public service", "approval", "policy"],
  identity:   ["identity", "verification", "trust", "authentication", "KYC"],
  general:    [],
};

function detectDomain(query: string): UJUDomain {
  const q = query.toLowerCase();
  for (const [domain, signals] of Object.entries(DOMAIN_SIGNALS) as [UJUDomain, string[]][]) {
    if (domain === "general") continue;
    if (signals.some((s) => q.includes(s))) return domain;
  }
  return "general";
}

// ------------------------------------------------------------------
// U¹ — Extract essence: strip filler, keep the signal.
// ------------------------------------------------------------------

const FILLER_PHRASES = [
  "basically", "essentially", "actually", "literally",
  "in order to", "it is important to", "you may want to",
  "consider", "perhaps", "maybe", "potentially", "generally speaking",
  "it is worth noting that", "please note that",
];

function extractEssence(text: string): string {
  let result = text;
  for (const phrase of FILLER_PHRASES) {
    result = result.replace(new RegExp(`\\b${phrase}\\b`, "gi"), "").replace(/\s{2,}/g, " ");
  }
  // Keep the first 3 substantive sentences.
  const sentences = result.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 10);
  return sentences.slice(0, 3).join(" ").trim();
}

// ------------------------------------------------------------------
// J — Prioritise: find the single highest-leverage action.
// ------------------------------------------------------------------

const ACTION_PATTERNS = [
  /(?:you should|you need to|try to)\s+([^.!?]{10,120})/i,
  /(?:recommend|suggest|advise)\s+(?:that\s+)?(?:you\s+)?([^.!?]{10,120})/i,
  /(?:start by|begin with|first(?:,|\s+step)?)\s+([^.!?]{10,120})/i,
  /(?:the key is to|the most important step is to)\s+([^.!?]{10,120})/i,
];

const DOMAIN_FALLBACK_ACTIONS: Record<UJUDomain, string> = {
  brand:      "Define your core brand promise in one sentence and publish it today.",
  content:    "Publish one piece of authentic, unpolished content in the next hour.",
  legal:      "Document everything. Build a timestamped timeline of events right now.",
  waste:      "Audit your primary waste stream for seven consecutive days.",
  finance:    "Identify your single largest cost centre and challenge every line item.",
  government: "Map the decision-maker chain before submitting any formal request.",
  identity:   "Collect and verify the minimum identity attributes your process requires.",
  general:    "Take the smallest possible action toward your goal within the next 30 minutes.",
};

function findPriorityAction(essence: string, domain: UJUDomain): string {
  for (const pattern of ACTION_PATTERNS) {
    const match = essence.match(pattern);
    if (match?.[1]) {
      const action = match[1].trim().replace(/,\s*$/, "");
      // Capitalise first letter.
      return action.charAt(0).toUpperCase() + action.slice(1) + ".";
    }
  }
  return DOMAIN_FALLBACK_ACTIONS[domain];
}

// ------------------------------------------------------------------
// Investment estimates by domain.
// ------------------------------------------------------------------

const DOMAIN_INVESTMENTS: Record<UJUDomain, string> = {
  brand:      "1–2 hours (positioning workshop or single focused writing session)",
  content:    "30–60 minutes (drafting, editing, and publishing)",
  legal:      "1–2 hours (research and timestamped documentation)",
  waste:      "$0–$100 depending on audit scope and tools required",
  finance:    "2–3 hours (data pull, line-item review, and prioritisation)",
  government: "1–2 hours (stakeholder mapping and submission preparation)",
  identity:   "1–4 hours (requirements gathering and verification setup)",
  general:    "15–30 minutes",
};

// ------------------------------------------------------------------
// Timeline estimates by domain.
// ------------------------------------------------------------------

const DOMAIN_TIMELINES: Record<UJUDomain, string> = {
  brand:      "3–7 days to measurable audience response",
  content:    "24–48 hours for initial engagement signal",
  legal:      "30 days for a Subject Access Request (SAR) response",
  waste:      "7 days for a complete baseline audit",
  finance:    "48–72 hours for a full cost picture",
  government: "5–15 working days for an initial acknowledgement",
  identity:   "24–48 hours to implement and test a verification flow",
  general:    "3–7 days to see first results",
};

// ------------------------------------------------------------------
// Hidden opportunity — the insight most people miss.
// ------------------------------------------------------------------

const DOMAIN_OPPORTUNITIES: Record<UJUDomain, string> = {
  brand:      "Your audience remembers the one thing you repeat, not the ten things you say. Pick one.",
  content:    "Your failures drive 3× more engagement than polished wins. Use them.",
  legal:      "Most people skip the SAR request. It contains 80% of the evidence you need.",
  waste:      "Your waste is someone else's raw material. Find that buyer before you pay to dispose.",
  finance:    "The cost you have accepted as fixed is usually the one most open to renegotiation.",
  government: "The decision is made before the meeting. Focus on pre-meeting conversations.",
  identity:   "Over-verification destroys conversion. Collect only what you will actually use.",
  general:    "The obvious path is crowded. The adjacent possibility almost always has less competition.",
};

// ------------------------------------------------------------------
// U² — Build the optimised output struct.
// ------------------------------------------------------------------

function buildOutput(
  priorityAction: string,
  essence: string,
  domain: UJUDomain
): Omit<UJURefinedOutput, "refinedAt" | "domain"> {
  return {
    priorityAction,
    context:          essence.slice(0, 220).trimEnd() + (essence.length > 220 ? "…" : ""),
    investment:       DOMAIN_INVESTMENTS[domain],
    timeline:         DOMAIN_TIMELINES[domain],
    hiddenOpportunity: DOMAIN_OPPORTUNITIES[domain],
    loopInstruction:  "Return with your results and IKENGA will generate your next step.",
  };
}

// ------------------------------------------------------------------
// Public entry point.
// ------------------------------------------------------------------

/**
 * Apply the UJU Cycle™ refinement to a raw AI response.
 *
 * This is the only export consumers should use.
 * The internal three-step process (U¹ → J → U²) is not exposed.
 */
export function refineResponse(input: UJURefinementInput): UJURefinedOutput {
  const domain = input.domain ?? detectDomain(input.userQuery);
  const essence = extractEssence(input.rawResponse);
  const priorityAction = findPriorityAction(essence, domain);
  const base = buildOutput(priorityAction, essence, domain);

  return {
    ...base,
    domain,
    refinedAt: new Date().toISOString(),
  };
}

/**
 * Serialise a refined output into the user-facing string format.
 *
 * The structure is intentional and branded.
 * It does not reveal the refinement process.
 */
export function formatRefinedOutput(output: UJURefinedOutput): string {
  return [
    `YOUR PRIORITY ACTION`,
    output.priorityAction,
    ``,
    `Why this matters:`,
    output.context,
    ``,
    `Investment: ${output.investment}`,
    `Timeline:   ${output.timeline}`,
    ``,
    output.loopInstruction,
    ``,
    `━━━ What most people miss ━━━`,
    output.hiddenOpportunity,
  ].join("\n");
}

/**
 * Standard response when users ask how the system works.
 * Truthful. Protects IP without deception.
 */
export function proprietaryResponse(): string {
  return "The refinement process is proprietary to UJU Cycle™. What would you like to work on?";
}
