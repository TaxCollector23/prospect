import { NextResponse } from "next/server";
import { getOpportunities } from "@/lib/data/opportunities";
import { rankOpportunities } from "@/lib/recommendation";
import { sendEmail } from "@/lib/email/send";
import { weeklyDigestEmail } from "@/lib/email/templates";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { DEFAULT_NOTIFICATIONS } from "@/lib/constants";
import type { UserProfile } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Weekly digest cron. Sends each opted-in user their top matched opportunities.
 * Scheduled via vercel.json (Mondays 14:00 UTC).
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const opportunities = await getOpportunities();

  // Without Firebase Admin we can't enumerate users — report readiness.
  if (!isAdminConfigured || !adminDb) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      message: "Configure Firebase Admin + Resend to send live digests.",
      opportunitiesAvailable: opportunities.length,
    });
  }

  const snap = await adminDb
    .collection("users")
    .where("notifications.weeklyDigest", "==", true)
    .get();

  let sent = 0;
  for (const doc of snap.docs) {
    const profile = doc.data() as UserProfile;
    const ranked = rankOpportunities(
      { ...profile, notifications: profile.notifications ?? DEFAULT_NOTIFICATIONS },
      opportunities,
    ).slice(0, 5);
    if (!ranked.length || !profile.email) continue;
    const { subject, html } = weeklyDigestEmail(
      profile.name?.split(" ")[0] ?? "there",
      ranked,
    );
    const res = await sendEmail({ to: profile.email, subject, html });
    if (res.ok) sent++;
  }

  return NextResponse.json({ ok: true, sent, recipients: snap.size });
}
