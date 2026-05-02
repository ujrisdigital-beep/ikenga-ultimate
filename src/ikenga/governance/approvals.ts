// ============================================================
// IKENGA GOVERNANCE — APPROVAL WORKFLOW
// Generic approval queue for prompts, deployments, and
// any governance-gated action within IKENGA.
// ============================================================

// ------------------------------------------------------------------
// Approval target types
// ------------------------------------------------------------------

export type ApprovalTargetType = "prompt" | "deployment" | "engine-update" | "access-grant";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "withdrawn";

// ------------------------------------------------------------------
// Approval request
// ------------------------------------------------------------------

export interface ApprovalRequest {
  requestId: string;           // UUID
  targetType: ApprovalTargetType;
  targetId: string;            // ID of the resource being approved
  requestedBy: string;         // Actor requesting approval
  requestedAt: string;         // ISO 8601
  reason: string;              // Why this action requires approval
  status: ApprovalStatus;
  reviewedBy?: string;         // Actor who reviewed
  reviewedAt?: string;         // ISO 8601
  reviewNote?: string;         // Optional note from reviewer
}

// ------------------------------------------------------------------
// In-memory approval store — backed by Supabase in Phase 7.
// ------------------------------------------------------------------

const approvalStore: ApprovalRequest[] = [];

// ------------------------------------------------------------------
// Workflow helpers
// ------------------------------------------------------------------

/** Submit a new approval request. */
export function requestApproval(
  data: Omit<ApprovalRequest, "requestId" | "requestedAt" | "status">
): ApprovalRequest {
  const request: ApprovalRequest = {
    ...data,
    requestId: crypto.randomUUID(),
    requestedAt: new Date().toISOString(),
    status: "pending",
  };
  approvalStore.push(request);
  return request;
}

/** Approve a pending request. */
export function grantApproval(
  requestId: string,
  reviewedBy: string,
  reviewNote?: string
): ApprovalRequest | null {
  const req = approvalStore.find((r) => r.requestId === requestId);
  if (!req || req.status !== "pending") return null;
  req.status = "approved";
  req.reviewedBy = reviewedBy;
  req.reviewedAt = new Date().toISOString();
  req.reviewNote = reviewNote;
  return req;
}

/** Reject a pending request. */
export function denyApproval(
  requestId: string,
  reviewedBy: string,
  reviewNote?: string
): ApprovalRequest | null {
  const req = approvalStore.find((r) => r.requestId === requestId);
  if (!req || req.status !== "pending") return null;
  req.status = "rejected";
  req.reviewedBy = reviewedBy;
  req.reviewedAt = new Date().toISOString();
  req.reviewNote = reviewNote;
  return req;
}

/** Withdraw a pending request (requester cancels). */
export function withdrawApproval(requestId: string): ApprovalRequest | null {
  const req = approvalStore.find((r) => r.requestId === requestId);
  if (!req || req.status !== "pending") return null;
  req.status = "withdrawn";
  return req;
}

/** Get all pending requests. */
export function getPendingApprovals(): ApprovalRequest[] {
  return approvalStore.filter((r) => r.status === "pending");
}

/** Get all requests for a specific target. */
export function getApprovalsForTarget(targetId: string): ApprovalRequest[] {
  return approvalStore.filter((r) => r.targetId === targetId);
}

/** Check if a target has an approved request. */
export function isApproved(targetId: string): boolean {
  return approvalStore.some(
    (r) => r.targetId === targetId && r.status === "approved"
  );
}
