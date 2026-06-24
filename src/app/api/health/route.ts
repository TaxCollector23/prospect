import { NextResponse } from "next/server";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { isAlgoliaConfigured } from "@/lib/search";
import { isAnalyticsEnabled } from "@/lib/analytics";
import { isEmailConfigured } from "@/lib/email/send";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "prospect",
    time: new Date().toISOString(),
    integrations: {
      firebase: isFirebaseConfigured,
      firebaseAdmin: isAdminConfigured,
      algolia: isAlgoliaConfigured,
      analytics: isAnalyticsEnabled,
      email: isEmailConfigured,
    },
    mode: isFirebaseConfigured ? "live" : "demo",
  });
}
