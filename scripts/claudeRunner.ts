import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";

export {};

type EnvMap = Record<string, string>;

function loadEnvFile(filePath: string): EnvMap {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const entries: EnvMap = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);

    if (!match) {
      continue;
    }

    const key = match[1];
    let value = match[2];

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries[key] = value;
  }

  return entries;
}

function ensureAnthropicApiKey(): string | null {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envValues = loadEnvFile(envPath);

  for (const [key, value] of Object.entries(envValues)) {
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey || apiKey === "your_key_here") {
    return null;
  }

  return apiKey;
}

async function main(): Promise<void> {
  const prompt = process.argv.slice(2).join(" ").trim();

  if (!prompt) {
    console.error('Usage: pnpm claude "Hello Claude"');
    process.exitCode = 1;
    return;
  }

  const apiKey = ensureAnthropicApiKey();

  if (!apiKey) {
    console.error(
      'Missing ANTHROPIC_API_KEY. Add ANTHROPIC_API_KEY="your_key_here" to .env.local with your real Anthropic API key.',
    );
    process.exitCode = 1;
    return;
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) {
      console.error("Claude returned no text response.");
      process.exitCode = 1;
      return;
    }

    console.log(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Claude request failed: ${message}`);
    process.exitCode = 1;
  }
}

void main();
