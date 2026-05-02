import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM = `You are a brand strategist and identity architect. Given a brand name and description, extract the brand's DNA with precision.

Return ONLY a valid raw JSON object — no markdown, no code fences, no text outside the JSON.

Your output must be specific to THIS brand, not generic marketing language. Every moat must be something this brand actually has based on the description, not something any brand could claim.`;

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json({ error: 'name and description required' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Brand name: ${name}\n\nDescription: ${description}\n\nExtract the brand DNA. Return this exact JSON:\n\n{\n  "moats": ["3-5 specific competitive advantages this brand actually has, not generic ones"],\n  "audience": "Precise target audience description — who they are, what they want, what they fear",\n  "voice_pillars": ["3-4 communication characteristics that define how this brand speaks"],\n  "positioning": "One sentence — how this brand is uniquely positioned in its market",\n  "industry": "Industry or sector",\n  "content_themes": ["4-5 recurring themes this brand should own in content"],\n  "tagline": "A sharp, memorable tagline (max 8 words)"\n}`,
      }],
    });

    const raw = response.content[0].type === 'text'
      ? response.content[0].text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
      : '{}';

    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error('Brand analyze error:', e);
    return NextResponse.json({ error: 'Brand analysis failed' }, { status: 500 });
  }
}
