import type { Opportunity } from "@/types";
import { clamp } from "./utils";

/**
 * Quality score (0–100). Factors:
 *  - verified organization
 *  - valid website present
 *  - completeness (description, requirements, eligibility, tags, logo)
 *  - recency (updated recently)
 *  - deadline present
 *
 * Used in ranking and surfaced in the admin dashboard.
 */
export function computeQualityScore(
  o: Partial<Opportunity> & { updatedAt?: string },
): number {
  let score = 0;

  // Verified organization — 25
  if (o.verified) score += 25;

  // Valid website — 12
  if (o.websiteUrl && isValidUrl(o.websiteUrl)) score += 12;

  // Valid application URL — 8
  if (o.applicationUrl && isValidUrl(o.applicationUrl)) score += 8;

  // Completeness — up to 30
  const desc = (o.description ?? "").length;
  if (desc > 400) score += 10;
  else if (desc > 150) score += 6;
  else if (desc > 0) score += 3;

  if ((o.shortDescription ?? "").length > 20) score += 4;
  if ((o.requirements?.length ?? 0) > 0) score += 5;
  if ((o.eligibility?.length ?? 0) > 0) score += 5;
  if ((o.tags?.length ?? 0) >= 3) score += 4;
  if (o.organizationLogo) score += 2;

  // Recency — up to 15
  if (o.updatedAt) {
    const days =
      (Date.now() - new Date(o.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 30) score += 15;
    else if (days <= 90) score += 10;
    else if (days <= 180) score += 5;
  }

  // Deadline present — 10
  if (o.deadline) score += 10;

  return clamp(Math.round(score));
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Label for a quality score, used in the admin UI. */
export function qualityTier(score: number): {
  label: string;
  tone: "success" | "warning" | "error";
} {
  if (score >= 75) return { label: "High", tone: "success" };
  if (score >= 50) return { label: "Medium", tone: "warning" };
  return { label: "Low", tone: "error" };
}
