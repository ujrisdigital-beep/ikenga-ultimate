import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const PLATFORMS = [
  'instagram', 'tiktok', 'twitter', 'linkedin', 'facebook', 'youtube',
  'pinterest', 'snapchat', 'whatsapp', 'telegram', 'email', 'blog',
  'newsletter', 'sms', 'ads', 'seo', 'press', 'podcast',
];

const PLATFORM_FORMATS: Record<string, string> = {
  instagram:  'Instagram caption with emojis (max 2200 chars)',
  tiktok:     'TikTok video caption, punchy and viral (max 300 chars)',
  twitter:    'Tweet (strictly max 280 characters)',
  linkedin:   'Professional LinkedIn post (300–700 chars)',
  facebook:   'Facebook post, engaging and shareable',
  youtube:    'YouTube video description (first 200 chars are critical)',
  pinterest:  'Pinterest pin description (max 500 chars)',
  snapchat:   'Snapchat caption, very short and punchy (max 80 chars)',
  whatsapp:   'WhatsApp broadcast message, conversational',
  telegram:   'Telegram channel post with formatting',
  email:      'Email newsletter opening paragraph',
  blog:       'Blog post opening hook (200–400 chars)',
  newsletter: 'Newsletter section (150–300 chars)',
  sms:        'SMS text (strictly max 160 characters)',
  ads:        'Ad copy with clear call-to-action (max 125 chars headline)',
  seo:        'SEO meta description (strictly max 160 chars)',
  press:      'Press release opening paragraph',
  podcast:    'Podcast episode intro script (30–45 seconds when spoken)',
};

const TONE_DESCRIPTIONS: Record<string, string> = {
  ikenga:  'Authoritative, ancestral wisdom, bold — speak with the gravitas of heritage. Powerful, declarative, commanding.',
  juo:     'Playful, energetic, trendy — vibrant language, high energy, culturally resonant. Fun and infectious.',
  oba:     'Royal, dignified, premium — refined and sophisticated. Aspirational language befitting royalty.',
  omenala: 'Traditional, spiritual, grounding — rooted in culture and wisdom. Warm, contemplative, reverent.',
  icheoku: 'Analytical, precise, strategic — data-driven, structured, methodical. Clear and purposeful.',
};

const VARIATION_ANGLES = [
  'storytelling angle — open with a vivid narrative moment that pulls the reader in',
  'data-driven angle — lead with a striking fact, number, or surprising statistic',
  'provocative angle — challenge the reader with a bold contrarian statement or question',
  'aspirational angle — paint a vivid picture of the outcome the audience wants',
  'urgency angle — create time-sensitive framing or scarcity without being generic',
  'social proof angle — lead with community signals, authority, or collective momentum',
  'curiosity gap angle — open an incomplete loop the reader cannot resist closing',
];

const BATCH_SYSTEM_PROMPT = (tone: string) => `
You are UJU CYCLE™ — IKENGA's proprietary AI content engine. You generate high-volume, platform-optimised content across 18 channels.

ACTIVE BRAND VOICE: ${tone.toUpperCase()}
${TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS.ikenga}

RULES:
- Apply the brand voice precisely — every word must reflect the active tone
- Respect all platform character limits strictly (Twitter: 280, SMS: 160, SEO: 160, Snapchat: 80, TikTok: 300, Ads headline: 125)
- Use emojis only where they suit the platform and tone
- Output ONLY a valid raw JSON object — no markdown, no code fences, no explanation outside the JSON
`.trim();

async function generateVariationRound(
  idea: string,
  tone: string,
  selectedPlatforms: string[],
  angle: string,
  variationNumber: number,
  scheduleOffset: number,
): Promise<Record<string, unknown>> {
  const platformEntries = selectedPlatforms
    .map((p) => `  "${p}": "${PLATFORM_FORMATS[p] || 'Post'}"`)
    .join(',\n');

  const userPrompt = `Content idea: "${idea}"

Variation ${variationNumber} — Use the ${angle}.

Generate platform-optimised content for each platform. Apply the active brand voice throughout.
Return ONLY this JSON structure with each value as an object:

{
${platformEntries}
}

Each value must be:
{
  "content": "<the generated content, respecting platform limits>",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "format": "<the content format used>",
  "angle": "${angle}"
}`;

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8192,
    system: [
      {
        type: 'text',
        text: BATCH_SYSTEM_PROMPT(tone),
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error(`No text response from Claude for variation ${variationNumber}`);
  }

  const raw = textBlock.text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  const parsed: Record<string, unknown> = JSON.parse(raw);

  const scheduleDate = new Date();
  scheduleDate.setDate(scheduleDate.getDate() + scheduleOffset);
  const scheduled = scheduleDate.toISOString().split('T')[0];

  const result: Record<string, unknown> = {};
  for (const platform of selectedPlatforms) {
    if (parsed[platform]) {
      result[`${platform}_${variationNumber}`] = {
        platform,
        variation: variationNumber,
        ...(parsed[platform] as object),
        scheduled,
        generatedAt: new Date().toISOString(),
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          cache_read: response.usage.cache_read_input_tokens ?? 0,
        },
      };
    }
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { idea, tone, platforms, count } = await request.json();

    if (!idea) {
      return NextResponse.json(
        { error: 'Missing required field: idea' },
        { status: 400 },
      );
    }

    const targetCount = Math.min(count || 128, 126); // cap at 7 rounds × 18 platforms
    const selectedPlatforms: string[] = platforms?.length > 0 ? platforms : PLATFORMS;
    const selectedTone = (tone as string) || 'ikenga';

    const rounds = Math.ceil(targetCount / selectedPlatforms.length);
    const effectiveRounds = Math.min(rounds, VARIATION_ANGLES.length);

    // Run up to 4 rounds in parallel to balance speed and rate limits
    const PARALLEL_BATCH = 4;
    const batch: Record<string, unknown> = {};
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCacheRead = 0;

    for (let i = 0; i < effectiveRounds; i += PARALLEL_BATCH) {
      const slice = Array.from(
        { length: Math.min(PARALLEL_BATCH, effectiveRounds - i) },
        (_, j) => i + j,
      );

      const results = await Promise.all(
        slice.map((roundIndex) =>
          generateVariationRound(
            idea,
            selectedTone,
            selectedPlatforms,
            VARIATION_ANGLES[roundIndex],
            roundIndex + 1,
            Math.floor(roundIndex * selectedPlatforms.length / 7),
          ),
        ),
      );

      for (const roundResult of results) {
        for (const [key, value] of Object.entries(roundResult)) {
          const v = value as Record<string, unknown>;
          const usage = v.usage as { input_tokens: number; output_tokens: number; cache_read: number } | undefined;
          if (usage) {
            totalInputTokens += usage.input_tokens;
            totalOutputTokens += usage.output_tokens;
            totalCacheRead += usage.cache_read;
          }
          const { usage: _u, ...rest } = v;
          batch[key] = rest;
        }
      }
    }

    const generated = Object.keys(batch).length;

    return NextResponse.json({
      success: true,
      batch,
      meta: {
        totalGenerated: generated,
        platforms: selectedPlatforms.length,
        rounds: effectiveRounds,
        tone: selectedTone,
        model: 'claude-opus-4-7',
        idea,
        usage: {
          input_tokens: totalInputTokens,
          output_tokens: totalOutputTokens,
          cache_read: totalCacheRead,
        },
      },
    });

  } catch (error) {
    console.error('Batch generation error:', error);
    return NextResponse.json(
      { error: 'Batch generation failed. Please try again.' },
      { status: 500 },
    );
  }
}
