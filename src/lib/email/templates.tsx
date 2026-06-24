import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import type { Opportunity } from "@/types";

/** Shared, email-client-safe shell with inline styles. */
function shell(title: string, body: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
        <span style="display:inline-block;width:28px;height:28px;background:#38BDF8;border-radius:8px;"></span>
        <span style="font-size:18px;font-weight:600;">${APP_NAME}</span>
      </div>
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;">
        <h1 style="margin:0 0 12px;font-size:20px;">${title}</h1>
        ${body}
      </div>
      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
        ${APP_NAME} — ${APP_TAGLINE}<br/>
        You're receiving this because you have a Prospect account.
        <a href="${absoluteUrl("/settings")}" style="color:#38BDF8;">Manage preferences</a>
      </p>
    </div>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#38BDF8;color:#06283D;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;margin-top:8px;">${label}</a>`;
}

export function welcomeEmail(name: string) {
  return {
    subject: `Welcome to ${APP_NAME} 🧭`,
    html: shell(
      `Welcome, ${name}!`,
      `<p style="color:#475569;line-height:1.6;">You're all set. Prospect now surfaces opportunities — scholarships, internships, fellowships, grants, and more — tailored to your interests and goals.</p>
       <p style="color:#475569;line-height:1.6;">Jump in and discover what's waiting for you.</p>
       ${button(absoluteUrl("/dashboard"), "Open your dashboard")}`,
    ),
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: `Reset your ${APP_NAME} password`,
    html: shell(
      "Reset your password",
      `<p style="color:#475569;line-height:1.6;">We received a request to reset your password. Click below to choose a new one. If you didn't request this, you can safely ignore this email.</p>
       ${button(resetUrl, "Reset password")}`,
    ),
  };
}

function opportunityList(opportunities: Opportunity[]): string {
  return opportunities
    .map(
      (o) => `
      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-top:12px;">
        <p style="margin:0;font-weight:600;">${o.title}</p>
        <p style="margin:4px 0;color:#64748b;font-size:14px;">${o.organization}</p>
        <p style="margin:8px 0;color:#475569;font-size:14px;line-height:1.5;">${o.shortDescription}</p>
        <a href="${absoluteUrl(`/opportunity/${o.id}`)}" style="color:#38BDF8;font-size:14px;font-weight:600;text-decoration:none;">View opportunity →</a>
      </div>`,
    )
    .join("");
}

export function weeklyDigestEmail(name: string, opportunities: Opportunity[]) {
  return {
    subject: `Your weekly opportunities, ${name} 🔭`,
    html: shell(
      "This week's top picks",
      `<p style="color:#475569;line-height:1.6;">Here are ${opportunities.length} fresh opportunities matched to you:</p>
       ${opportunityList(opportunities)}
       <div style="margin-top:20px;">${button(absoluteUrl("/dashboard"), "See all opportunities")}</div>`,
    ),
  };
}

export function opportunityAlertEmail(name: string, opportunities: Opportunity[]) {
  return {
    subject: `New opportunities matched to you`,
    html: shell(
      `${opportunities.length} new matches`,
      `<p style="color:#475569;line-height:1.6;">Hi ${name}, new opportunities just landed that fit your interests:</p>
       ${opportunityList(opportunities)}`,
    ),
  };
}

export function deadlineReminderEmail(name: string, opportunities: Opportunity[]) {
  return {
    subject: `⏰ Deadlines approaching for saved opportunities`,
    html: shell(
      "Deadlines coming up",
      `<p style="color:#475569;line-height:1.6;">Hi ${name}, these saved opportunities are closing soon — don't miss them:</p>
       ${opportunityList(opportunities)}`,
    ),
  };
}

export function applicationReminderEmail(name: string, opportunity: Opportunity) {
  return {
    subject: `Finish your application: ${opportunity.title}`,
    html: shell(
      "Pick up where you left off",
      `<p style="color:#475569;line-height:1.6;">Hi ${name}, you started exploring <strong>${opportunity.title}</strong> from ${opportunity.organization}. Ready to apply?</p>
       ${button(opportunity.applicationUrl, "Continue application")}`,
    ),
  };
}
