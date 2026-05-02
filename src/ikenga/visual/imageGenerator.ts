// ============================================================
// IKENGA VISUAL ENGINE
// Multi-source image generation with automatic fallbacks.
//
// Priority order:
//   1. Pollinations.ai   — completely free, no API key, no limit
//   2. Hugging Face      — free tier, requires HUGGINGFACE_API_KEY
//   3. Unsplash          — free stock photo fallback, no API key needed
//
// Stability AI skipped — their free tier requires card verification.
// Lexica skipped — their API is read-only (search, not generate).
// ============================================================

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface ImageGenerationInput {
  /** What to depict in the image. */
  prompt: string;
  /** Brand style context appended to every prompt. */
  brandContext?: string;
  /** Width in pixels. Default 1024. */
  width?: number;
  /** Height in pixels. Default 1024. */
  height?: number;
}

export interface ImageGenerationResult {
  success: boolean;
  /** Public URL or data: URL ready to use in <img src>. */
  url: string;
  /** Which source produced the image. */
  source: "pollinations" | "huggingface" | "unsplash" | "failed";
  prompt: string;
  error?: string;
}

// ------------------------------------------------------------------
// Style suffix — appended to every prompt for quality
// ------------------------------------------------------------------

const STYLE_SUFFIX =
  "professional photography, high quality, sharp focus, cinematic lighting, 4k";

function buildPrompt(input: ImageGenerationInput): string {
  const parts = [input.prompt.trim()];
  if (input.brandContext?.trim()) parts.push(input.brandContext.trim());
  parts.push(STYLE_SUFFIX);
  return parts.join(", ");
}

// ------------------------------------------------------------------
// SOURCE 1 — Pollinations.ai (free, no key, no rate limit)
// Returns a direct image URL — no binary download needed.
// ------------------------------------------------------------------

async function tryPollinations(
  input: ImageGenerationInput
): Promise<ImageGenerationResult | null> {
  try {
    const prompt = buildPrompt(input);
    const w = input.width ?? 1024;
    const h = input.height ?? 1024;
    const encoded = encodeURIComponent(prompt);
    // Pollinations serves images at a stable URL — verify it loads.
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&enhance=true`;

    const check = await fetch(url, { method: "HEAD" });
    if (!check.ok) return null;

    return { success: true, url, source: "pollinations", prompt };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// SOURCE 2 — Hugging Face Inference API (free tier, key required)
// Falls back automatically if HUGGINGFACE_API_KEY is not set.
// ------------------------------------------------------------------

async function tryHuggingFace(
  input: ImageGenerationInput
): Promise<ImageGenerationResult | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const prompt = buildPrompt(input);
    // Use a smaller, faster model that loads reliably on free tier.
    const model = "runwayml/stable-diffusion-v1-5";

    const res = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Wait-For-Model": "true",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: Math.min(input.width ?? 512, 768),
            height: Math.min(input.height ?? 512, 768),
            num_inference_steps: 20,
            guidance_scale: 7,
          },
        }),
      }
    );

    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) return null; // Not a real image

    const base64 = buffer.toString("base64");
    return {
      success: true,
      url: `data:image/png;base64,${base64}`,
      source: "huggingface",
      prompt,
    };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// SOURCE 3 — Unsplash Source (free stock photo fallback, no key)
// Returns a relevant stock photo based on the prompt keywords.
// ------------------------------------------------------------------

function buildUnsplashUrl(input: ImageGenerationInput): string {
  const w = input.width ?? 1024;
  const h = input.height ?? 1024;
  // Extract the first 5 meaningful words from the prompt as search terms.
  const keywords = input.prompt
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5)
    .join(",");

  return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(keywords)}`;
}

async function tryUnsplash(
  input: ImageGenerationInput
): Promise<ImageGenerationResult | null> {
  try {
    const url = buildUnsplashUrl(input);
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!res.ok) return null;

    return {
      success: true,
      url,
      source: "unsplash",
      prompt: input.prompt,
    };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Public API — tries sources in priority order, returns first success
// ------------------------------------------------------------------

export async function generateImage(
  input: ImageGenerationInput
): Promise<ImageGenerationResult> {
  const result =
    (await tryPollinations(input)) ??
    (await tryHuggingFace(input)) ??
    (await tryUnsplash(input));

  if (result) return result;

  return {
    success: false,
    url: "",
    source: "failed",
    prompt: input.prompt,
    error: "All image sources failed. Check network connectivity.",
  };
}

// ------------------------------------------------------------------
// Convenience generators for common IKENGA content formats
// ------------------------------------------------------------------

/** 1:1 square — ideal for Instagram, LinkedIn posts. */
export function generateSocialImage(
  postConcept: string,
  brandContext?: string
): Promise<ImageGenerationResult> {
  return generateImage({ prompt: postConcept, brandContext, width: 1024, height: 1024 });
}

/** 16:9 landscape — ideal for Twitter/X banners, YouTube thumbnails. */
export function generateBannerImage(
  concept: string,
  brandContext?: string
): Promise<ImageGenerationResult> {
  return generateImage({ prompt: concept, brandContext, width: 1280, height: 720 });
}

/** 9:16 portrait — ideal for Instagram/TikTok stories and reels. */
export function generateStoryImage(
  concept: string,
  brandContext?: string
): Promise<ImageGenerationResult> {
  return generateImage({ prompt: concept, brandContext, width: 720, height: 1280 });
}
