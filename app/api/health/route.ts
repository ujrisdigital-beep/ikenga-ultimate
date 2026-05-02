import { hasAnthropicApiKey } from "../../../src/ikenga/lib/aiConfig";
import { getSiteUrl, isConfiguredUrl } from "../../../src/ikenga/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasValue(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export async function GET(): Promise<Response> {
  const checks = {
    siteUrl: isConfiguredUrl(process.env.NEXT_PUBLIC_SITE_URL),
    supabaseUrl: isConfiguredUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseServiceRoleKey: hasValue("SUPABASE_SERVICE_ROLE_KEY"),
    adminApiToken: hasValue("IKENGA_ADMIN_API_TOKEN"),
    anthropicApiKey: hasAnthropicApiKey(),
  };

  const ready = Object.values(checks).every(Boolean);

  return Response.json(
    {
      service: "ikenga-mvp",
      status: ready ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      siteUrl: getSiteUrl(),
      checks,
    },
    {
      status: ready ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
