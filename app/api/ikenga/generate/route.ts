import {
  generateIkengaContent,
  IKENGA_MAX_ATTACHMENTS,
  normalizeIkengaGenerationInput,
  type IkengaGenerationInput,
} from "../../../../src/ikenga/content/ikengaGenerator";
import {
  getIkengaAnthropicModel,
  hasAnthropicApiKey,
} from "../../../../src/ikenga/lib/aiConfig";
import { requireAdminApiAccess } from "../../../../src/ikenga/lib/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store",
  };
}

function readStringValue(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseListValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parseListValue(parsed);
    }
  } catch {
    // Fall back to simple delimiter parsing.
  }

  return trimmed
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseFormList(formData: FormData, keys: string[]): string[] {
  return keys.flatMap((key) =>
    formData
      .getAll(key)
      .flatMap((value) => (typeof value === "string" ? parseListValue(value) : []))
  );
}

function parseFileList(formData: FormData): File[] {
  return ["files", "files[]", "file", "attachments", "attachments[]"].flatMap(
    (key) =>
      formData
        .getAll(key)
        .filter((value): value is File => value instanceof File && value.size > 0)
  );
}

function validateInput(input: IkengaGenerationInput, files: File[]): string[] {
  const errors: string[] = [];

  if (!input.brand) {
    errors.push("The 'brand' field is required.");
  }

  if (!input.goals) {
    errors.push("The 'goals' field is required.");
  }

  if (files.length > IKENGA_MAX_ATTACHMENTS) {
    errors.push(`Upload up to ${IKENGA_MAX_ATTACHMENTS} files per request.`);
  }

  return errors;
}

async function parseRequest(
  request: Request
): Promise<{ input: IkengaGenerationInput; files: File[] }> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return {
      input: normalizeIkengaGenerationInput({
        brand: readStringValue(formData.get("brand")),
        niche: readStringValue(formData.get("niche")),
        goals: readStringValue(formData.get("goals")),
        audience: readStringValue(formData.get("audience")),
        offer: readStringValue(formData.get("offer")),
        tone: readStringValue(formData.get("tone")),
        website: readStringValue(formData.get("website")),
        notes: readStringValue(formData.get("notes")),
        contentPillars: parseFormList(formData, [
          "contentPillars",
          "contentPillars[]",
        ]),
        callsToAction: parseFormList(formData, [
          "callsToAction",
          "callsToAction[]",
        ]),
      }),
      files: parseFileList(formData),
    };
  }

  const body = (await request.json()) as Record<string, unknown>;

  return {
    input: normalizeIkengaGenerationInput({
      brand: typeof body.brand === "string" ? body.brand : undefined,
      niche: typeof body.niche === "string" ? body.niche : undefined,
      goals: typeof body.goals === "string" ? body.goals : undefined,
      audience: typeof body.audience === "string" ? body.audience : undefined,
      offer: typeof body.offer === "string" ? body.offer : undefined,
      tone: typeof body.tone === "string" ? body.tone : undefined,
      website: typeof body.website === "string" ? body.website : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
      contentPillars: parseListValue(body.contentPillars),
      callsToAction: parseListValue(body.callsToAction),
    }),
    files: [],
  };
}

export async function GET(request: Request): Promise<Response> {
  const accessDenied = requireAdminApiAccess(request);
  if (accessDenied) {
    return accessDenied;
  }

  const ready = hasAnthropicApiKey();

  return Response.json(
    {
      service: "ikenga-generate",
      status: ready ? "ok" : "degraded",
      model: getIkengaAnthropicModel(),
      accepts: ["application/json", "multipart/form-data"],
      requiredFields: ["brand", "goals"],
      optionalFields: [
        "niche",
        "audience",
        "offer",
        "tone",
        "website",
        "contentPillars",
        "callsToAction",
        "notes",
        "files",
      ],
      maxAttachments: IKENGA_MAX_ATTACHMENTS,
    },
    {
      status: ready ? 200 : 503,
      headers: jsonHeaders(),
    }
  );
}

export async function POST(request: Request): Promise<Response> {
  const accessDenied = requireAdminApiAccess(request);
  if (accessDenied) {
    return accessDenied;
  }

  let parsedRequest: { input: IkengaGenerationInput; files: File[] };

  try {
    parsedRequest = await parseRequest(request);
  } catch {
    return Response.json(
      { error: "Invalid request body. Send JSON or multipart form data." },
      { status: 400, headers: jsonHeaders() }
    );
  }

  const errors = validateInput(parsedRequest.input, parsedRequest.files);
  if (errors.length > 0) {
    return Response.json(
      { error: "Validation failed.", details: errors },
      { status: 400, headers: jsonHeaders() }
    );
  }

  try {
    const result = await generateIkengaContent(
      parsedRequest.input,
      parsedRequest.files
    );

    return Response.json(
      {
        success: true,
        ...result,
      },
      { status: 200, headers: jsonHeaders() }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("Missing Anthropic credentials") ? 503 : 500;

    return Response.json(
      {
        success: false,
        error: message || "IKENGA generation failed.",
      },
      { status, headers: jsonHeaders() }
    );
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

