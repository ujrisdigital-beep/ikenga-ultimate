// ============================================================
// IKENGA CONTENT - PLANNER
// Phase 3 content planning and scheduling helper with support
// for Claude, GPT, and hybrid strategy modes. The logic is a
// placeholder so the plan can be stored and reviewed before
// automated publishing is added.
// ============================================================

import { randomUUID } from "node:crypto";

import type { ContentModel, ContentType } from "./generator";

// ------------------------------------------------------------------
// Planning request and result contracts.
// ------------------------------------------------------------------

export interface ContentPlanningRequest {
  campaignName: string;
  objective: string;
  audience: string;
  channels: string[];
  frequencyPerWeek: number;
  durationWeeks: number;
  model: ContentModel;
  preferredTypes?: ContentType[];
}

export interface ContentPlanItem {
  id: string;
  title: string;
  topic: string;
  type: ContentType;
  channel: string;
  scheduledFor: string;
  model: ContentModel;
  rationale: string;
  status: "planned";
}

export interface ContentPlan {
  id: string;
  campaignName: string;
  objective: string;
  audience: string;
  model: ContentModel;
  items: ContentPlanItem[];
  createdAt: string;
}

function chooseType(index: number, preferredTypes?: ContentType[]): ContentType {
  const fallbackTypes: ContentType[] = [
    "article",
    "social-post",
    "email",
    "landing-page",
    "campaign-brief",
  ];

  const source = preferredTypes?.length ? preferredTypes : fallbackTypes;
  return source[index % source.length];
}

function buildRationale(model: ContentModel, channel: string, objective: string): string {
  if (model === "claude") {
    return `Claude planning mode emphasizes message clarity and structured storytelling for ${channel} around ${objective}.`;
  }

  if (model === "gpt") {
    return `GPT planning mode emphasizes variation, testing ideas, and adaptive messaging for ${channel}.`;
  }

  return `Hybrid planning mode combines Claude structure and GPT variation for ${channel} with the goal of ${objective}.`;
}

/**
 * Create a placeholder content schedule for a campaign.
 */
export function createContentPlan(
  request: ContentPlanningRequest
): ContentPlan {
  const items: ContentPlanItem[] = [];
  const totalItems = request.frequencyPerWeek * request.durationWeeks;
  const baseDate = new Date();

  for (let index = 0; index < totalItems; index += 1) {
    const scheduledDate = new Date(baseDate);
    scheduledDate.setDate(baseDate.getDate() + index * 2);

    const channel = request.channels[index % request.channels.length] ?? "web";
    const type = chooseType(index, request.preferredTypes);

    items.push({
      id: randomUUID(),
      title: `${request.campaignName} - Content ${index + 1}`,
      topic: `${request.objective} for ${request.audience}`,
      type,
      channel,
      scheduledFor: scheduledDate.toISOString(),
      model: request.model,
      rationale: buildRationale(request.model, channel, request.objective),
      status: "planned",
    });
  }

  return {
    id: randomUUID(),
    campaignName: request.campaignName,
    objective: request.objective,
    audience: request.audience,
    model: request.model,
    items,
    createdAt: new Date().toISOString(),
  };
}
