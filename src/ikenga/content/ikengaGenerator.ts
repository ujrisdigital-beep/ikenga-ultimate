import Anthropic from "@anthropic-ai/sdk";
import type { ContentBlockParam } from "@anthropic-ai/sdk/resources/messages/messages";

import {
  getAnthropicApiKey,
  getIkengaAnthropicModel,
} from "../lib/aiConfig";

export const IKENGA_MAX_ATTACHMENTS = 5;

const IKENGA_MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
const IKENGA_MAX_TEXT_ATTACHMENT_CHARS = 12_000;
const IKENGA_SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const IKENGA_SUPPORTED_TEXT_TYPES = new Set([
  "application/json",
  "application/ld+json",
  "application/xml",
  "application/x-yaml",
  "text/csv",
  "text/html",
  "text/markdown",
  "text/plain",
  "text/xml",
]);
const IKENGA_TEXT_FILE_EXTENSIONS = new Set([
  ".csv",
  ".html",
  ".json",
  ".markdown",
  ".md",
  ".txt",
  ".xml",
  ".yaml",
  ".yml",
]);

/* eslint-disable @typescript-eslint/no-unused-vars */
// Schema kept as documentation only — not passed to the API (avoids grammar size limits).
// The system prompt instructs Claude to match this structure.
const _ikengaGenerationSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "requestSummary",
    "brandVoiceSummary",
    "calendar",
    "socialPosts",
    "videoScripts",
    "carouselOutlines",
    "emails",
    "ads",
    "executionNotes",
  ],
  properties: {
    requestSummary: {
      type: "object",
      additionalProperties: false,
      required: [
        "brand",
        "niche",
        "goals",
        "audience",
        "offer",
        "contentPillars",
        "callsToAction",
      ],
      properties: {
        brand: { type: "string" },
        niche: { type: "string" },
        goals: { type: "string" },
        audience: { type: "string" },
        offer: { type: "string" },
        contentPillars: {
          type: "array",
          minItems: 3,
          items: { type: "string" },
        },
        callsToAction: {
          type: "array",
          minItems: 1,
          items: { type: "string" },
        },
      },
    },
    brandVoiceSummary: {
      type: "object",
      additionalProperties: false,
      required: [
        "positioning",
        "tone",
        "messagingRules",
        "proofPoints",
        "differentiators",
      ],
      properties: {
        positioning: { type: "string" },
        tone: { type: "string" },
        messagingRules: {
          type: "array",
          minItems: 3,
          items: { type: "string" },
        },
        proofPoints: {
          type: "array",
          minItems: 3,
          items: { type: "string" },
        },
        differentiators: {
          type: "array",
          minItems: 3,
          items: { type: "string" },
        },
      },
    },
    calendar: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "dayNumber",
          "theme",
          "primaryGoal",
          "channelFocus",
          "contentAngle",
          "callToAction",
        ],
        properties: {
          dayNumber: {
            type: "integer",
            minimum: 1,
            maximum: 7,
          },
          theme: { type: "string" },
          primaryGoal: { type: "string" },
          channelFocus: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
          },
          contentAngle: { type: "string" },
          callToAction: { type: "string" },
        },
      },
    },
    socialPosts: {
      type: "array",
      minItems: 14,
      maxItems: 14,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "dayNumber",
          "platform",
          "format",
          "hook",
          "caption",
          "callToAction",
          "assetBrief",
          "hashtags",
        ],
        properties: {
          id: { type: "string" },
          dayNumber: {
            type: "integer",
            minimum: 1,
            maximum: 7,
          },
          platform: { type: "string" },
          format: { type: "string" },
          hook: { type: "string" },
          caption: { type: "string" },
          callToAction: { type: "string" },
          assetBrief: { type: "string" },
          hashtags: {
            type: "array",
            minItems: 3,
            maxItems: 8,
            items: { type: "string" },
          },
        },
      },
    },
    videoScripts: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["dayNumber", "title", "hook", "scenes", "callToAction"],
        properties: {
          dayNumber: {
            type: "integer",
            minimum: 1,
            maximum: 7,
          },
          title: { type: "string" },
          hook: { type: "string" },
          scenes: {
            type: "array",
            minItems: 3,
            maxItems: 6,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["beat", "visual", "narration"],
              properties: {
                beat: { type: "string" },
                visual: { type: "string" },
                narration: { type: "string" },
              },
            },
          },
          callToAction: { type: "string" },
        },
      },
    },
    carouselOutlines: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["dayNumber", "title", "slides", "callToAction"],
        properties: {
          dayNumber: {
            type: "integer",
            minimum: 1,
            maximum: 7,
          },
          title: { type: "string" },
          slides: {
            type: "array",
            minItems: 5,
            maxItems: 8,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["slideNumber", "headline", "supportingCopy"],
              properties: {
                slideNumber: {
                  type: "integer",
                  minimum: 1,
                },
                headline: { type: "string" },
                supportingCopy: { type: "string" },
              },
            },
          },
          callToAction: { type: "string" },
        },
      },
    },
    emails: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "dayNumber",
          "subjectLine",
          "previewText",
          "audienceSegment",
          "body",
          "callToAction",
        ],
        properties: {
          dayNumber: {
            type: "integer",
            minimum: 1,
            maximum: 7,
          },
          subjectLine: { type: "string" },
          previewText: { type: "string" },
          audienceSegment: { type: "string" },
          body: { type: "string" },
          callToAction: { type: "string" },
        },
      },
    },
    ads: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["audience", "angle", "headline", "primaryText", "callToAction"],
        properties: {
          audience: { type: "string" },
          angle: { type: "string" },
          headline: { type: "string" },
          primaryText: { type: "string" },
          callToAction: { type: "string" },
        },
      },
    },
    executionNotes: {
      type: "object",
      additionalProperties: false,
      required: ["priorities", "risks", "missingInputs"],
      properties: {
        priorities: {
          type: "array",
          minItems: 3,
          items: { type: "string" },
        },
        risks: {
          type: "array",
          minItems: 1,
          items: { type: "string" },
        },
        missingInputs: {
          type: "array",
          minItems: 1,
          items: { type: "string" },
        },
      },
    },
  },
} as const;
/* eslint-enable @typescript-eslint/no-unused-vars */

const IKENGA_SYSTEM_PROMPT = `
You are IKENGA, a commercial content automation engine for brands, agencies, and operators.

Your job is to turn a brief into assets that can drive awareness, leads, booked calls, sales, or email growth.

Rules:
- Output ONLY a raw JSON object. No markdown, no code fences, no explanation before or after.
- The JSON must have exactly these top-level keys:
  requestSummary, brandVoiceSummary, calendar, socialPosts, videoScripts, carouselOutlines, emails, ads, executionNotes
- calendar: array of 7 objects (dayNumber, theme, primaryGoal, channelFocus, contentAngle, callToAction)
- socialPosts: array of 14 objects (id, dayNumber, platform, format, hook, caption, callToAction, assetBrief, hashtags)
- videoScripts: array of 7 objects (dayNumber, title, hook, scenes[3-6], callToAction)
- carouselOutlines: array of 7 objects (dayNumber, title, slides[5-8], callToAction)
- emails: array of 7 objects (dayNumber, subjectLine, previewText, audienceSegment, body, callToAction)
- ads: array of 3 objects (audience, angle, headline, primaryText, callToAction)
- executionNotes: object with priorities[], risks[], missingInputs[]
- Make every asset specific, publishable, and conversion-aware.
- Use uploaded files as source of truth for tone, offer, and proof.
- Do not use filler, generic platitudes, or placeholder phrases.
- If something important is missing, make a conservative assumption and list it in executionNotes.missingInputs.
`.trim();

export interface IkengaGenerationInput {
  brand: string;
  niche: string;
  goals: string;
  audience?: string;
  offer?: string;
  tone?: string;
  website?: string;
  notes?: string;
  contentPillars: string[];
  callsToAction: string[];
}

export interface IkengaAttachmentSummary {
  filename: string;
  mediaType: string;
  size: number;
  status: "used" | "ignored";
  kind: "image" | "pdf" | "text" | "unsupported";
  note?: string;
}

export interface IkengaGenerationResult {
  requestId: string;
  model: string;
  anthropicMessageId: string;
  stopReason: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationInputTokens: number | null;
    cacheReadInputTokens: number | null;
  };
  attachments: IkengaAttachmentSummary[];
  output: unknown;
}

function randomId(): string {
  return crypto.randomUUID();
}

function normalizeLines(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

function truncateText(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, maxChars)}\n\n[Truncated by IKENGA to fit the model context window.]`;
}

function getFileExtension(filename: string): string {
  const extension = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  return extension ?? "";
}

function isTextFile(file: File): boolean {
  return (
    IKENGA_SUPPORTED_TEXT_TYPES.has(file.type) ||
    IKENGA_TEXT_FILE_EXTENSIONS.has(getFileExtension(file.name))
  );
}

function normalizeList(values: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized;
}

function buildBrief(
  input: IkengaGenerationInput,
  attachments: IkengaAttachmentSummary[]
): string {
  const contentPillars =
    input.contentPillars.length > 0
      ? input.contentPillars.join(", ")
      : "Infer the best pillars from the niche, goals, and notes.";
  const callsToAction =
    input.callsToAction.length > 0
      ? input.callsToAction.join(", ")
      : "Infer the strongest CTA from the stated goals and offer.";
  const attachmentNotes = attachments.length
    ? attachments
        .filter((attachment) => attachment.status === "used")
        .map(
          (attachment) =>
            `- ${attachment.filename} (${attachment.kind}, ${attachment.mediaType || "unknown"})`
        )
        .join("\n")
    : "- None";

  return [
    "Build a 7-day commercial content operating pack for this brand.",
    "",
    `Brand: ${input.brand}`,
    `Niche: ${input.niche}`,
    `Goals: ${input.goals}`,
    `Audience: ${input.audience ?? "Not provided. Infer the most likely buyer."}`,
    `Offer: ${input.offer ?? "Not provided. Infer the most likely monetizable offer."}`,
    `Tone: ${input.tone ?? "Not provided. Infer from the brief and attachments."}`,
    `Website: ${input.website ?? "Not provided."}`,
    `Content pillars: ${contentPillars}`,
    `Preferred calls to action: ${callsToAction}`,
    `Additional notes: ${input.notes ?? "None."}`,
    "",
    "Reference files attached:",
    attachmentNotes,
    "",
    "Execution priorities:",
    "- Make every asset specific enough to publish with light editing.",
    "- Write with conviction and commercial intent, not generic inspiration.",
    "- Use proof, objections, buyer psychology, and clarity whenever the brief supports it.",
    "- Keep the weekly plan coherent so the assets compound across the 7-day cycle.",
  ].join("\n");
}

async function buildAttachmentPayload(
  files: File[]
): Promise<{
  attachments: IkengaAttachmentSummary[];
  blocks: ContentBlockParam[];
}> {
  const attachments: IkengaAttachmentSummary[] = [];
  const blocks: ContentBlockParam[] = [];

  for (const file of files.slice(0, IKENGA_MAX_ATTACHMENTS)) {
    if (file.size === 0) {
      attachments.push({
        filename: file.name,
        mediaType: file.type,
        size: file.size,
        status: "ignored",
        kind: "unsupported",
        note: "Empty files are ignored.",
      });
      continue;
    }

    if (file.size > IKENGA_MAX_ATTACHMENT_BYTES) {
      attachments.push({
        filename: file.name,
        mediaType: file.type,
        size: file.size,
        status: "ignored",
        kind: "unsupported",
        note: `File exceeded the ${Math.floor(
          IKENGA_MAX_ATTACHMENT_BYTES / 1024 / 1024
        )}MB limit.`,
      });
      continue;
    }

    if (IKENGA_SUPPORTED_IMAGE_TYPES.has(file.type)) {
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

      attachments.push({
        filename: file.name,
        mediaType: file.type,
        size: file.size,
        status: "used",
        kind: "image",
      });
      blocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
          data: base64,
        },
      });
      continue;
    }

    if (file.type === "application/pdf" || getFileExtension(file.name) === ".pdf") {
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

      attachments.push({
        filename: file.name,
        mediaType: file.type || "application/pdf",
        size: file.size,
        status: "used",
        kind: "pdf",
      });
      blocks.push({
        type: "document",
        title: file.name,
        context:
          "Use this PDF as reference material for brand voice, offer clarity, and proof.",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      });
      continue;
    }

    if (isTextFile(file)) {
      const text = truncateText(
        normalizeLines(await file.text()),
        IKENGA_MAX_TEXT_ATTACHMENT_CHARS
      );

      attachments.push({
        filename: file.name,
        mediaType: file.type || "text/plain",
        size: file.size,
        status: "used",
        kind: "text",
      });
      blocks.push({
        type: "document",
        title: file.name,
        context:
          "Use this text reference to understand the brand's positioning, claims, and tone.",
        source: {
          type: "text",
          media_type: "text/plain",
          data: text,
        },
      });
      continue;
    }

    attachments.push({
      filename: file.name,
      mediaType: file.type,
      size: file.size,
      status: "ignored",
      kind: "unsupported",
      note: "Unsupported file type. Use text, PDF, or common image formats.",
    });
  }

  return { attachments, blocks };
}

export function normalizeIkengaGenerationInput(
  input: Partial<IkengaGenerationInput>
): IkengaGenerationInput {
  return {
    brand: input.brand?.trim() ?? "",
    niche: input.niche?.trim() || "general",
    goals: input.goals?.trim() ?? "",
    audience: input.audience?.trim() || undefined,
    offer: input.offer?.trim() || undefined,
    tone: input.tone?.trim() || undefined,
    website: input.website?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    contentPillars: normalizeList(input.contentPillars ?? []),
    callsToAction: normalizeList(input.callsToAction ?? []),
  };
}

export async function generateIkengaContent(
  input: IkengaGenerationInput,
  files: File[] = []
): Promise<IkengaGenerationResult> {
  const apiKey = getAnthropicApiKey();

  if (!apiKey) {
    throw new Error(
      "Missing Anthropic credentials. Set ANTHROPIC_API_KEY or CLAUDE_API_KEY on the server."
    );
  }

  const model = getIkengaAnthropicModel();
  const requestId = randomId();
  const { attachments, blocks } = await buildAttachmentPayload(files);
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: 12_000,
    temperature: 0.6,
    system: IKENGA_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: buildBrief(input, attachments),
          },
          ...blocks,
        ],
      },
    ],
  });

  const rawText = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  if (!rawText.trim()) {
    throw new Error("Anthropic returned an empty IKENGA payload.");
  }

  let parsed: unknown;
  try {
    // Strip accidental markdown fences if Claude added them despite instructions.
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`IKENGA response was not valid JSON. Raw: ${rawText.slice(0, 200)}`);
  }

  return {
    requestId,
    model: response.model,
    anthropicMessageId: response.id,
    stopReason: response.stop_reason,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheCreationInputTokens: response.usage.cache_creation_input_tokens ?? null,
      cacheReadInputTokens: response.usage.cache_read_input_tokens ?? null,
    },
    attachments,
    output: parsed,
  };
}

