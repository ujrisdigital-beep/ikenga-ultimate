// ============================================================
// IKENGA CONTENT - FEEDBACK
// Phase 3 feedback capture and summarization for generated
// content. This module supports Claude, GPT, and hybrid review
// modes while keeping the implementation intentionally simple.
// ============================================================

import { randomUUID } from "node:crypto";

import type { ContentModel } from "./generator";

// ------------------------------------------------------------------
// Feedback contracts.
// ------------------------------------------------------------------

export interface ContentFeedbackRequest {
  contentId: string;
  reviewer: string;
  model: ContentModel;
  sentiment: "positive" | "neutral" | "negative";
  comments: string;
  suggestedActions?: string[];
}

export interface ContentFeedbackEntry {
  id: string;
  contentId: string;
  reviewer: string;
  model: ContentModel;
  sentiment: "positive" | "neutral" | "negative";
  comments: string;
  suggestedActions: string[];
  createdAt: string;
}

export interface ContentFeedbackSummary {
  contentId: string;
  model: ContentModel;
  totalEntries: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  summary: string;
}

const feedbackStore: ContentFeedbackEntry[] = [];

/**
 * Record a feedback entry in memory for Phase 3.
 */
export function recordContentFeedback(
  request: ContentFeedbackRequest
): ContentFeedbackEntry {
  const entry: ContentFeedbackEntry = {
    id: randomUUID(),
    contentId: request.contentId,
    reviewer: request.reviewer,
    model: request.model,
    sentiment: request.sentiment,
    comments: request.comments,
    suggestedActions: request.suggestedActions ?? [],
    createdAt: new Date().toISOString(),
  };

  feedbackStore.push(entry);
  return entry;
}

/**
 * Read all feedback for one content item.
 */
export function listContentFeedback(contentId: string): ContentFeedbackEntry[] {
  return feedbackStore.filter((entry) => entry.contentId === contentId);
}

/**
 * Summarize feedback using placeholder logic for the chosen model mode.
 */
export function summarizeContentFeedback(
  contentId: string,
  model: ContentModel
): ContentFeedbackSummary {
  const entries = listContentFeedback(contentId);
  const positiveCount = entries.filter((entry) => entry.sentiment === "positive").length;
  const neutralCount = entries.filter((entry) => entry.sentiment === "neutral").length;
  const negativeCount = entries.filter((entry) => entry.sentiment === "negative").length;

  const modelSummary =
    model === "claude"
      ? "Claude mode emphasizes nuanced qualitative review."
      : model === "gpt"
        ? "GPT mode emphasizes actionable iteration ideas."
        : "Hybrid mode blends nuanced review with actionable iteration ideas.";

  return {
    contentId,
    model,
    totalEntries: entries.length,
    positiveCount,
    neutralCount,
    negativeCount,
    summary: `${modelSummary} Feedback totals: ${positiveCount} positive, ${neutralCount} neutral, ${negativeCount} negative.`,
  };
}
