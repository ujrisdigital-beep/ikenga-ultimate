export const APP_NAME = "IKENGA AI";
export const APP_TAGLINE = "Chi in Motion";
export const APP_DESCRIPTION =
  "IKENGA AI helps brands, agencies, and creators turn ideas into consistent, high-conviction content across every platform.";
export const DEFAULT_SITE_URL = "http://localhost:3000";

export function getSiteUrl(): string {
  const rawValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!rawValue) {
    return DEFAULT_SITE_URL;
  }

  try {
    return new URL(rawValue).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function isConfiguredUrl(value: string | undefined): boolean {
  if (!value?.trim()) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
