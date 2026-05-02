import { supabase } from "../../../src/ikenga/lib/supabase";
import { sendWelcomeEmail } from "../../../src/ikenga/email/sequences";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WaitlistBody {
  email?: unknown;
  source?: unknown;
  honey?: unknown;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function POST(request: Request): Promise<Response> {
  let body: WaitlistBody;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? normalizeEmail(body.email) : null;
  const source =
    typeof body.source === "string" && body.source.trim()
      ? body.source.trim()
      : "landing-page";
  const honey = typeof body.honey === "string" ? body.honey.trim() : "";

  if (honey) {
    return Response.json({ success: true }, { status: 202 });
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");

  try {
    const { error } = await supabase.from("waitlist_signups").insert({
      email,
      source,
      status: "pending",
      metadata: {
        forwardedFor,
        referer,
        userAgent,
      },
    });

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          {
            success: true,
            message:
              "You are already on the list. We will reach out when your access opens.",
          },
          { status: 200 }
        );
      }

      return Response.json({ error: error.message }, { status: 500 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json(
      {
        error:
          message ||
          "The waitlist is temporarily unavailable. Please try again shortly.",
      },
      { status: 503 }
    );
  }

  // Fire welcome email — non-blocking, failure does not affect signup response.
  sendWelcomeEmail(email).catch(() => {});

  return Response.json(
    {
      success: true,
      message:
        "You're in. We'll send your early-access invite and launch updates to that inbox.",
    },
    { status: 201 }
  );
}
