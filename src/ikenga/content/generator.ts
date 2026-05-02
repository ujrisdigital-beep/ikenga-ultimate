// ============================================================
// IKENGA CONTENT - GENERATOR
// Phase 3 placeholder content generation for Claude, GPT,
// and hybrid mode. This file focuses on the creation step
// and keeps the runtime logic simple until live SDK calls
// are connected.
// ============================================================

import { randomUUID } from "node:crypto";

// ------------------------------------------------------------------
// Models currently supported by the content engine.
// ------------------------------------------------------------------

export type ContentModel = "claude" | "gpt" | "hybrid";

// ------------------------------------------------------------------
// Optional logger hook for observability and audit integration.
// ------------------------------------------------------------------

export type ContentLogLevel = "info" | "warn" | "error";

export interface ContentLogEvent {
  level: ContentLogLevel;
  message: string;
  phase: "generation";
  itemId?: string;
  model: ContentModel;
  timestamp: string;
  details?: Record<string, unknown>;
}

export type ContentLogger = (event: ContentLogEvent) => void | Promise<void>;

// ------------------------------------------------------------------
// Input shape for generation.
// ------------------------------------------------------------------

export type ContentType =
  | "article"
  | "social-post"
  | "email"
  | "landing-page"
  | "campaign-brief";

export interface ContentGenerationRequest {
  title: string;
  topic: string;
  objective: string;
  audience: string;
  type: ContentType;
  model: ContentModel;
  tone?: string;
  keywords?: string[];
  prompt?: string;
  context?: Record<string, unknown>;
  logger?: ContentLogger;
}

// ------------------------------------------------------------------
// Output shape for generated content records.
// ------------------------------------------------------------------

export interface GeneratedContent {
  id: string;
  title: string;
  topic: string;
  objective: string;
  audience: string;
  type: ContentType;
  model: ContentModel;
  content: string;
  summary: string;
  tags: string[];
  status: "draft";
  createdAt: string;
  updatedAt: string;
}

async function emitLog(
  logger: ContentLogger | undefined,
  event: Omit<ContentLogEvent, "timestamp">
): Promise<void> {
  if (!logger) {
    return;
  }

  await logger({
    ...event,
    timestamp: new Date().toISOString(),
  });
}

function buildPrompt(request: ContentGenerationRequest): string {
  const keywordBlock = request.keywords?.length
    ? `Keywords: ${request.keywords.join(", ")}`
    : "Keywords: none provided";

  return [
    `Title: ${request.title}`,
    `Topic: ${request.topic}`,
    `Objective: ${request.objective}`,
    `Audience: ${request.audience}`,
    `Type: ${request.type}`,
    `Tone: ${request.tone ?? "balanced"}`,
    keywordBlock,
    request.prompt ? `Prompt: ${request.prompt}` : "Prompt: not provided",
  ].join("\n");
}

function generateClaudeDraft(prompt: string): string {
  return [
    "[Placeholder Claude Draft]",
    "Claude focuses on depth, narrative coherence, and structured framing.",
    prompt,
  ].join("\n\n");
}

function generateGptDraft(prompt: string): string {
  return [
    "[Placeholder GPT Draft]",
    "GPT focuses on breadth, adaptation, and alternate phrasing.",
    prompt,
  ].join("\n\n");
}

function generateHybridDraft(prompt: string): string {
  return [
    "[Placeholder Hybrid Draft]",
    "Hybrid mode combines Claude structure with GPT expansion.",
    generateClaudeDraft(prompt),
    generateGptDraft(prompt),
  ].join("\n\n---\n\n");
}

/**
 * Generate a draft content item using placeholder logic.
 */
export async function generateContent(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  const itemId = randomUUID();
  const prompt = buildPrompt(request);

  await emitLog(request.logger, {
    level: "info",
    message: "Content generation started.",
    phase: "generation",
    itemId,
    model: request.model,
    details: { topic: request.topic, type: request.type },
  });

  let content: string;

  switch (request.model) {
    case "claude":
      content = generateClaudeDraft(prompt);
      break;
    case "gpt":
      content = generateGptDraft(prompt);
      break;
    case "hybrid":
      content = generateHybridDraft(prompt);
      break;
    default:
      throw new Error(`Unsupported content model: ${request.model satisfies never}`);
  }

  const now = new Date().toISOString();

  const item: GeneratedContent = {
    id: itemId,
    title: request.title,
    topic: request.topic,
    objective: request.objective,
    audience: request.audience,
    type: request.type,
    model: request.model,
    content,
    summary: `Placeholder ${request.model} summary for ${request.title}.`,
    tags: [request.topic, request.type, ...(request.keywords ?? [])],
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  await emitLog(request.logger, {
    level: "info",
    message: "Content generation completed.",
    phase: "generation",
    itemId,
    model: request.model,
    details: { summary: item.summary },
  });

  return item;
}
