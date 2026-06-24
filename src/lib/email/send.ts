import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL || "Prospect <onboarding@resend.dev>";

export const isEmailConfigured = Boolean(apiKey);

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ ok: boolean; id?: string; skipped?: boolean; error?: string }> {
  if (!resend) {
    // Demo / unconfigured: log instead of sending so flows still "work".
    console.info("[email] (skipped — no RESEND_API_KEY)", { to, subject });
    return { ok: true, skipped: true };
  }
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "send failed" };
  }
}
