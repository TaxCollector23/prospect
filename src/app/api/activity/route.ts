import { NextResponse } from "next/server";
import { activitySchema } from "@/types/schemas";
import { adminDb, adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Server-side activity logging. The client also logs locally; this endpoint
 * persists authenticated events when Firebase Admin is configured.
 */
export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "activity"), {
    limit: 120,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = activitySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  if (!isAdminConfigured || !adminDb || !adminAuth) {
    return NextResponse.json({ ok: true, persisted: false, mode: "demo" });
  }

  // Verify Firebase ID token.
  const auth = req.headers.get("authorization") ?? "";
  const idToken = auth.replace(/^Bearer\s+/i, "");
  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await adminDb.collection("user_activity").add({
    userId: uid,
    opportunityId: parsed.data.opportunityId,
    actionType: parsed.data.actionType,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, persisted: true });
}
