const DEFAULT_IKENGA_ANTHROPIC_MODEL = "claude-sonnet-4-5";

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getAnthropicApiKey(): string | null {
  return readEnv("ANTHROPIC_API_KEY") ?? readEnv("CLAUDE_API_KEY");
}

export function hasAnthropicApiKey(): boolean {
  return Boolean(getAnthropicApiKey());
}

export function getIkengaAnthropicModel(): string {
  return readEnv("IKENGA_ANTHROPIC_MODEL") ?? DEFAULT_IKENGA_ANTHROPIC_MODEL;
}

