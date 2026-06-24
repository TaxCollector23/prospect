import { NextResponse } from "next/server";
import { getOpportunities } from "@/lib/data/opportunities";
import { sendEmail } from "@/lib/email/send";
import { deadlineReminderEmail } from "@/lib/email/templates";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { UserProfile } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOON_DAYS = 7;

function closingSoon(deadline?: string | null): boolean {
  if (!deadline) return false;
  const days = (new Date(deadline).getTime() - Date.now()) / 86_400_000;
  return days >= 0 && days <= SOON_DAYS;
}

/**
 * Daily deadline-reminder cron. Emails users whose saved opportunities are
 * closing within a week. Scheduled via vercel.json (daily 13:00 UTC).
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const opportunities = await getOpportunities();
  const byId = new Map(opportunities.map((o) => [o.id, o]));

  if (!isAdminConfigured || !adminDb) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      closingSoon: opportunities.filter((o) => closingSoon(o.deadline)).length,
      message: "Configure Firebase Admin + Resend to send live reminders.",
    });
  }

  // Group saved opportunities by user.
  const savedSnap = await adminDb.collection("saved_opportunities").get();
  const byUser = new Map<string, string[]>();
  for (const doc of savedSnap.docs) {
    const { userId, opportunityId } = doc.data() as {
      userId: string;
      opportunityId: string;
    };
    const o = byId.get(opportunityId);
    if (o && closingSoon(o.deadline)) {
      byUser.set(userId, [...(byUser.get(userId) ?? []), opportunityId]);
    }
  }

  let sent = 0;
  for (const [userId, ids] of byUser) {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) continue;
    const profile = userDoc.data() as UserProfile;
    if (!profile.notifications?.deadlineReminders || !profile.email) continue;
    const list = ids
      .map((id) => byId.get(id))
      .filter((o): o is NonNullable<typeof o> => Boolean(o));
    const { subject, html } = deadlineReminderEmail(
      profile.name?.split(" ")[0] ?? "there",
      list,
    );
    const res = await sendEmail({ to: profile.email, subject, html });
    if (res.ok) sent++;
  }

  return NextResponse.json({ ok: true, sent, usersNotified: byUser.size });
}
