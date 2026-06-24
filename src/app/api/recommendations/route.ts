import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpportunities } from "@/lib/data/opportunities";
import { rankOpportunities } from "@/lib/recommendation";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { DEFAULT_NOTIFICATIONS } from "@/lib/constants";
import type { UserProfile } from "@/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  interests: z.array(z.string()).default([]),
  careerGoals: z.string().default(""),
  country: z.string().default(""),
  limit: z.number().int().min(1).max(50).default(12),
});

/**
 * Returns ranked opportunities for a lightweight profile payload. The full
 * personalized feed is computed client-side; this endpoint supports server
 * rendering, email digests, and integrations.
 */
export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "recs"), { limit: 60, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const profile: UserProfile = {
    uid: "api",
    name: "API",
    email: "api@prospect.app",
    country: parsed.data.country,
    interests: parsed.data.interests,
    careerGoals: parsed.data.careerGoals,
    referralSource: "",
    notifications: DEFAULT_NOTIFICATIONS,
    profileCompletion: 100,
    onboarded: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const opportunities = await getOpportunities();
  const ranked = rankOpportunities(profile, opportunities).slice(
    0,
    parsed.data.limit,
  );

  return NextResponse.json({
    count: ranked.length,
    results: ranked.map((o) => ({
      id: o.id,
      title: o.title,
      organization: o.organization,
      matchScore: o.matchScore,
      matchReasons: o.matchReasons,
      opportunityType: o.opportunityType,
      deadline: o.deadline,
    })),
  });
}
