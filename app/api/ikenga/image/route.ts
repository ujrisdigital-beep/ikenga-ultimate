// ============================================================
// API ROUTE — /api/ikenga/image
// Generate an image via the IKENGA Visual Engine.
// Tries Pollinations → Hugging Face → Unsplash automatically.
// Method: POST
// No admin token required — Pollinations is public.
// ============================================================

import { generateImage } from "../../../../src/ikenga/visual/imageGenerator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { prompt, brandContext, width, height } = body;

  if (typeof prompt !== "string" || !prompt.trim()) {
    return Response.json({ error: "prompt is required." }, { status: 400 });
  }

  const result = await generateImage({
    prompt:       prompt.trim(),
    brandContext: typeof brandContext === "string" ? brandContext.trim() : undefined,
    width:        typeof width === "number" ? width : undefined,
    height:       typeof height === "number" ? height : undefined,
  });

  return Response.json(result, { status: result.success ? 200 : 503 });
}

export async function GET(): Promise<Response> {
  return Response.json({
    service: "ikenga-image",
    sources: ["pollinations (free, no key)", "huggingface (free, key optional)", "unsplash (fallback)"],
    requiredFields: ["prompt"],
    optionalFields: ["brandContext", "width", "height"],
    formats: {
      social:  "1024x1024",
      banner:  "1280x720",
      story:   "720x1280",
    },
  });
}
