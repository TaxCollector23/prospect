import { NextResponse } from "next/server";
import { ingestionSchema } from "@/types/schemas";
import { computeQualityScore } from "@/lib/quality";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import type { Opportunity } from "@/types";

export const runtime = "nodejs";

/**
 * Opportunity ingestion endpoint. Supports manual, CSV-derived, and API
 * sources, and is the seam for a future crawler. Authenticated via a Bearer
 * token (INGESTION_API_KEY). Each opportunity is validated and quality-scored
 * before being written.
 */
export async function POST(req: Request) {
  // Rate limit
  const rl = rateLimit(clientKey(req, "ingest"), { limit: 20, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // Auth
  const expected = process.env.INGESTION_API_KEY;
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse + validate
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ingestionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const now = new Date().toISOString();
  const prepared: Opportunity[] = parsed.data.opportunities.map((o, i) => {
    const base = {
      ...o,
      id: `${parsed.data.source}-${Date.now()}-${i}`,
      organizationLogo: o.organizationLogo ?? null,
      deadline: o.deadline ?? null,
      websiteUrl: o.websiteUrl ?? null,
      discordServerName: o.discordServerName ?? null,
      discordServerUrl: o.discordServerUrl ?? null,
      amount: o.amount ?? null,
      popularity: 0,
      qualityScore: 0,
      createdAt: now,
      updatedAt: now,
    } as Opportunity;
    base.qualityScore = computeQualityScore(base);
    return base;
  });

  // Persist when Firebase Admin is configured.
  if (isAdminConfigured && adminDb) {
    const batch = adminDb.batch();
    for (const o of prepared) {
      const { id, ...data } = o;
      batch.set(adminDb.collection("opportunities").doc(id), data);
    }
    await batch.commit();
    return NextResponse.json({
      ingested: prepared.length,
      persisted: true,
      ids: prepared.map((o) => o.id),
    });
  }

  // Demo mode: validate + score, but don't persist.
  return NextResponse.json({
    ingested: prepared.length,
    persisted: false,
    mode: "demo",
    preview: prepared.map((o) => ({
      id: o.id,
      title: o.title,
      qualityScore: o.qualityScore,
    })),
  });
}
