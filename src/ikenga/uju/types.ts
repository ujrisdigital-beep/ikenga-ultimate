// ============================================================
// UJU CYCLE™ — TYPES
// Proprietary refinement contracts for the IKENGA platform.
// ============================================================

/**
 * Domain categories the refiner uses to tune its output.
 * Extend this as new engine verticals are added.
 */
export type UJUDomain =
  | "brand"
  | "content"
  | "legal"
  | "waste"
  | "finance"
  | "government"
  | "identity"
  | "general";

/**
 * The raw input fed into the refiner.
 */
export interface UJURefinementInput {
  /** Raw AI response to be refined. */
  rawResponse: string;
  /** The original user query that produced the response. */
  userQuery: string;
  /** Optional domain hint — refiner will auto-detect if omitted. */
  domain?: UJUDomain;
  /** Actor identity for audit purposes. */
  actor?: string;
  /** Session ID for audit trail linkage. */
  sessionId?: string;
}

/**
 * The structured, optimised output produced by the UJU Cycle™.
 */
export interface UJURefinedOutput {
  /** The single highest-leverage action for the user. */
  priorityAction: string;
  /** Concise context supporting the action. */
  context: string;
  /** Time or money investment estimate. */
  investment: string;
  /** Expected timeline to first visible result. */
  timeline: string;
  /** The non-obvious opportunity most people miss. */
  hiddenOpportunity: string;
  /** Instruction to return with results for the next step. */
  loopInstruction: string;
  /** Detected or supplied domain. */
  domain: UJUDomain;
  /** ISO 8601 timestamp of refinement. */
  refinedAt: string;
}
