import { timingSafeEqual } from "node:crypto";

const ADMIN_TOKEN_ENV = "IKENGA_ADMIN_API_TOKEN";

function readAdminToken(): string | null {
  const token = process.env[ADMIN_TOKEN_ENV]?.trim();
  return token ? token : null;
}

function getSubmittedToken(request: Request): string | null {
  const authorizationHeader = request.headers.get("authorization");

  if (authorizationHeader?.startsWith("Bearer ")) {
    const bearerToken = authorizationHeader.slice("Bearer ".length).trim();
    if (bearerToken) {
      return bearerToken;
    }
  }

  const fallbackHeader = request.headers.get("x-ikenga-admin-token")?.trim();
  return fallbackHeader || null;
}

function tokensMatch(submittedToken: string, expectedToken: string): boolean {
  const submittedBuffer = Buffer.from(submittedToken);
  const expectedBuffer = Buffer.from(expectedToken);

  if (submittedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(submittedBuffer, expectedBuffer);
}

export function requireAdminApiAccess(request: Request): Response | null {
  const expectedToken = readAdminToken();

  if (!expectedToken) {
    return Response.json(
      {
        error:
          "Engine admin API is disabled until IKENGA_ADMIN_API_TOKEN is configured on the server.",
      },
      { status: 503 }
    );
  }

  const submittedToken = getSubmittedToken(request);

  if (!submittedToken || !tokensMatch(submittedToken, expectedToken)) {
    return Response.json(
      { error: "Unauthorized. A valid admin API token is required." },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="ikenga-admin"',
        },
      }
    );
  }

  return null;
}
