// ============================================================
// IKENGA CONTENT - EVALUATOR
// Phase 3 scoring utilities for generated content. This module
// provides placeholder evaluation for Claude, GPT, and hybrid
// workflows so content can be reviewed before live rubric or
// ML-based scoring is introduced.
// ============================================================

import { randomUUID } from "node:crypto";

import type { ContentModel, GeneratedContent } from "./generator";

// ------------------------------------------------------------------
// Scoring model for content evaluation.
// ------------------------------------------------------------------

export interface ContentEvaluationRequest {
  content: GeneratedContent;
  model: ContentModel;
  rubric?: string[];
}

export interface ContentMetricScore {
  metric: "clarity" | "relevance" | "brand-alignment" | "engagement";
  score: number;
  explanation: string;
}

export interface ContentEvaluation {
  id: string;
  contentId: string;
  model: ContentModel;
  overallScore: number;
  metrics: ContentMetricScore[];
  recommendation: "publish" | "revise" | "hold";
  createdAt: string;
}

function baselineScore(model: ContentModel): number {
  switch (model) {
    case "claude":
      return 84;
    case "gpt":
      return 82;
    case "hybrid":
      return 88;
    default:
      return 75;
  }
}

/**
 * Score content with a simple deterministic placeholder rubric.
 */
export function evaluateContent(
  request: ContentEvaluationRequest
): ContentEvaluation {
  const base = baselineScore(request.model);

  const metrics: ContentMetricScore[] = [
    {
      metric: "clarity",
      score: base,
      explanation: `${request.model} placeholder score for clarity based on structured content heuristics.`,
    },
    {
      metric: "relevance",
      score: base - 2,
      explanation: `Placeholder relevance score using topic match for ${request.content.topic}.`,
    },
    {
      metric: "brand-alignment",
      score: base - 1,
      explanation: "Placeholder brand-alignment score derived from tone and objective matching.",
    },
    {
      metric: "engagement",
      score: base + 1,
      explanation: "Placeholder engagement score derived from title, tags, and format mix.",
    },
  ];

  const overallScore = Math.round(
    metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length
  );

  return {
    id: randomUUID(),
    contentId: request.content.id,
    model: request.model,
    overallScore,
    metrics,
    recommendation:
      overallScore >= 85 ? "publish" : overallScore >= 75 ? "revise" : "hold",
    createdAt: new Date().toISOString(),
  };
}
