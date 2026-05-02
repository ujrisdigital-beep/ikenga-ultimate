// ============================================================
// IKENGA EMAIL SEQUENCE ENGINE
// Powered by Resend (free tier: 3,000 emails/month)
// Sends automated welcome + nurture sequences to waitlist signups.
// Server-side only. Never import in client components.
// ============================================================

const RESEND_API_URL = "https://api.resend.com/emails";

function getResendKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null;
}

function getFromAddress(): string {
  return process.env.IKENGA_FROM_EMAIL?.trim() || "IKENGA AI <onboarding@resend.dev>";
}

// ------------------------------------------------------------------
// Core send function
// ------------------------------------------------------------------

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = getResendKey();
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured." };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      reply_to: input.replyTo,
    }),
  });

  const data = (await res.json()) as { id?: string; message?: string; name?: string };

  if (!res.ok) {
    return { success: false, error: data.message ?? `Resend error ${res.status}` };
  }

  return { success: true, id: data.id };
}

// ------------------------------------------------------------------
// Email templates
// ------------------------------------------------------------------

function welcomeEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="padding:0 0 32px 0;text-align:center">
          <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.18em;color:#FFD700">IKENGA</p>
          <p style="margin:4px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:#666">Chi in Motion</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#111;border:1px solid #222;border-radius:16px;padding:40px">
          <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#FFF4C0;line-height:1.2">
            You're in. Your journey starts now.
          </h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#aaa">
            We received your early access request. You're among the first to claim your place in the IKENGA ecosystem — a creative intelligence engine built for brands that refuse to move small.
          </p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#aaa">
            <strong style="color:#FFD700">What happens next:</strong><br>
            We're onboarding in batches. When your access opens, you'll get a direct invite with your login link — no waitlist lottery, no algorithms. First in, first served.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:32px 0">
            <tr><td style="background:#FFD700;border-radius:100px;text-align:center">
              <a href="https://ikenga-mvp.vercel.app" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#000;text-decoration:none">
                See IKENGA Live →
              </a>
            </td></tr>
          </table>

          <p style="margin:0;font-size:14px;line-height:1.7;color:#555">
            Questions? Reply to this email. Every message goes directly to the founders.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0 0;text-align:center">
          <p style="margin:0;font-size:12px;color:#444">
            © 2026 IKENGA AI · Chi in Motion<br>
            You're receiving this because you signed up at ikenga-mvp.vercel.app
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function day3NurtureHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <tr><td style="padding:0 0 32px 0;text-align:center">
          <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.18em;color:#FFD700">IKENGA</p>
          <p style="margin:4px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:#666">Chi in Motion</p>
        </td></tr>

        <tr><td style="background:#111;border:1px solid #222;border-radius:16px;padding:40px">
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#FFF4C0;line-height:1.2">
            Most brands are invisible. Here's why yours doesn't have to be.
          </h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#aaa">
            The average founder posts 3 times, sees no results, and quits. Not because the idea was wrong — because the system was broken.
          </p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#aaa">
            IKENGA is built on a different premise: <strong style="color:#FFD700">your brand has a Chi</strong> — a rhythm, a voice, a momentum pattern. When that's captured and systematised, content stops being a chore and starts being a compounding asset.
          </p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#aaa">
            In one generation run, IKENGA produces:<br>
            · 14 platform-ready social posts<br>
            · 7 video scripts<br>
            · 7 email sequences<br>
            · 3 conversion ads<br>
            · A 7-day content calendar
          </p>
          <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#aaa">
            All in your voice. All ready to publish.
          </p>

          <table cellpadding="0" cellspacing="0" style="margin:0">
            <tr><td style="background:#FFD700;border-radius:100px;text-align:center">
              <a href="https://ikenga-mvp.vercel.app#waitlist" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#000;text-decoration:none">
                Secure Your Early Access →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 0 0;text-align:center">
          <p style="margin:0;font-size:12px;color:#444">
            © 2026 IKENGA AI · Chi in Motion
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function day7NurtureHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <tr><td style="padding:0 0 32px 0;text-align:center">
          <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.18em;color:#FFD700">IKENGA</p>
          <p style="margin:4px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:0.22em;color:#666">Chi in Motion</p>
        </td></tr>

        <tr><td style="background:#111;border:1px solid #222;border-radius:16px;padding:40px">
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#FFF4C0;line-height:1.2">
            One week in. Your spot is still held.
          </h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#aaa">
            We're opening the first batch of IKENGA accounts this month. If you're on this list, you're ahead of everyone who hasn't moved yet.
          </p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#aaa">
            <strong style="color:#FFD700">One thing we've learned building IKENGA:</strong><br>
            The brands that win are not the ones with the biggest budgets. They're the ones with the most consistent voice and the tightest content loop. IKENGA is that loop.
          </p>
          <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#aaa">
            Reply to this email with your brand name and we'll personally review your brief before your onboarding call.
          </p>

          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:#FFD700;border-radius:100px;text-align:center">
              <a href="https://ikenga-mvp.vercel.app" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#000;text-decoration:none">
                Reply With Your Brand →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 0 0;text-align:center">
          <p style="margin:0;font-size:12px;color:#444">© 2026 IKENGA AI · Chi in Motion</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

// ------------------------------------------------------------------
// Public sequence functions
// ------------------------------------------------------------------

/** Send the immediate welcome email to a new waitlist signup. */
export async function sendWelcomeEmail(email: string): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    subject: "You're in — IKENGA early access confirmed",
    html: welcomeEmailHtml(email),
  });
}

/** Send day-3 nurture email. Call this from a cron or Supabase trigger. */
export async function sendDay3Email(email: string): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    subject: "Why most brands stay invisible (and how IKENGA changes that)",
    html: day3NurtureHtml(),
  });
}

/** Send day-7 nurture email. */
export async function sendDay7Email(email: string): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    subject: "One week in — your IKENGA spot is still held",
    html: day7NurtureHtml(),
  });
}
