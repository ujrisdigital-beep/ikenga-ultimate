import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { BrandProfile, VIDEO_PLATFORMS, CAROUSEL_PLATFORMS } from '@/lib/studioTypes';

const client = new Anthropic();

const VOICE_DESC: Record<string, string> = {
  IKENGA:  'Bold, authentic, entrepreneurial fire. Every word moves. Unapologetic momentum. No filler.',
  JUO:     'Playful, energetic, culturally resonant. Trendy but substantive. Makes people share.',
  OBA:     'Royal, dignified, premium. Commands attention without raising its voice. Aspirational.',
  OMENALA: 'Rooted in culture and ancestral wisdom. Warm, contemplative, grounding. Timeless.',
  ICHEOKU: 'Analytical, precise, data-informed. Structured and clear. Respects the audience\'s intelligence.',
};

function buildSystemPrompt(brand: BrandProfile, voice: string): string {
  return `You are IKENGA AI — a brand intelligence engine that creates deeply specific, brand-guided content.

BRAND DNA — ${brand.name.toUpperCase()}
Industry: ${brand.industry}
Positioning: ${brand.positioning}
Unique Moats: ${brand.moats.join(' · ')}
Target Audience: ${brand.audience}
Voice Pillars: ${brand.voice_pillars.join(' · ')}
Content Themes: ${brand.content_themes.join(' · ')}

ACTIVE VOICE: ${voice.toUpperCase()}
${VOICE_DESC[voice] || VOICE_DESC.IKENGA}

IRON RULE — Every piece of content must:
1. Make ${brand.name}'s moats UNDENIABLE — they must be felt, not stated
2. Sound like it could ONLY come from ${brand.name} — not any other brand in the world
3. Target the specific audience reality: "${brand.audience}"
4. Apply the ${voice} voice in every word and sentence structure
5. Never be generic — if any other brand could say it, rewrite it

Return ONLY a valid raw JSON object. No markdown. No code fences. No text outside the JSON.`;
}

function buildPlatformSchema(platforms: string[]): string {
  return platforms.map(p => {
    const isVideo    = (VIDEO_PLATFORMS as readonly string[]).includes(p);
    const isCarousel = (CAROUSEL_PLATFORMS as readonly string[]).includes(p);

    if (isVideo) return `"${p}": { "content_type": "video", "text": "<caption>", "hashtags": [], "video_script": { "hook": "<3-second opener>", "scenes": [{"id":"scene_1","description":"<visual>","caption":"<on-screen text max 80 chars>","voiceover":"<spoken>","image_prompt":"<detailed prompt for AI image gen — mood, color, subject, style>","duration":5}], "cta": "<end CTA>" } }`;
    if (isCarousel) return `"${p}": { "content_type": "carousel", "text": "<caption>", "hashtags": [], "carousel_slides": [{"id":"slide_1","number":1,"title":"<headline>","body":"<2-3 sentences>","image_prompt":"<background image prompt>"},{"id":"slide_2","number":2,"title":"","body":"","image_prompt":""},{"id":"slide_3","number":3,"title":"","body":"","image_prompt":""},{"id":"slide_4","number":4,"title":"","body":"","image_prompt":""},{"id":"slide_5","number":5,"title":"","body":"","image_prompt":"","cta":"<CTA>"}] }`;
    return `"${p}": { "content_type": "text", "text": "<platform-optimised content>", "hashtags": [] }`;
  }).join(',\n');
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, voice, platforms, brandProfile } = await req.json() as {
      prompt: string;
      voice: string;
      platforms: string[];
      brandProfile: BrandProfile;
    };

    if (!prompt || !platforms?.length || !brandProfile) {
      return NextResponse.json({ error: 'prompt, platforms, and brandProfile required' }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(brandProfile, voice || 'IKENGA');
    const platformSchema = buildPlatformSchema(platforms);

    const userPrompt = `Content goal: "${prompt}"

Generate brand-guided content for every platform below. Make ${brandProfile.name}'s identity undeniable in each piece.

For VIDEO platforms (tiktok, youtube, facebook): generate a full video_script with hook + 4-6 scenes + CTA.
Each scene needs a detailed image_prompt that an AI image generator can use to create the scene visual.

For CAROUSEL platforms (instagram, linkedin): generate 5 slides minimum.
Each slide needs a compelling image_prompt for its background.

Return this exact JSON:
{
  "brand_lens": {
    "key_moat": "<which specific moat this content batch centers on>",
    "audience_insight": "<the audience truth this content exploits>",
    "content_angle": "<the specific angle taken across all platforms>"
  },
  "platforms": {
${platformSchema}
  }
}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    });

    const raw = response.content[0].type === 'text'
      ? response.content[0].text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
      : '{}';

    let parsed: { brand_lens: unknown; platforms: Record<string, unknown> };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Generation produced invalid JSON. Try again.' }, { status: 500 });
    }

    // Normalise each platform content
    const content: Record<string, unknown> = {};
    for (const p of platforms) {
      const raw_p = parsed.platforms?.[p];
      if (raw_p && typeof raw_p === 'object') {
        content[p] = { approved: false, edited: false, ...(raw_p as object) };
      }
    }

    return NextResponse.json({
      brand_lens: parsed.brand_lens,
      content,
      meta: {
        voice,
        platforms: platforms.length,
        brand: brandProfile.name,
        usage: {
          input_tokens:  response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          cache_read:    response.usage.cache_read_input_tokens ?? 0,
        },
      },
    });
  } catch (e) {
    console.error('Generate studio error:', e);
    return NextResponse.json({ error: 'Content generation failed. Please try again.' }, { status: 500 });
  }
}
