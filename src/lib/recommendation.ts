import type {
  MatchBreakdown,
  Opportunity,
  ScoredOpportunity,
  UserActivity,
  UserProfile,
} from "@/types";
import { OPPORTUNITY_TYPE_LABEL } from "./constants";
import { clamp } from "./utils";

/**
 * Weights for each recommendation signal. They sum to 1 so the final
 * weighted score lands naturally in 0–100.
 */
const WEIGHTS = {
  interest: 0.3,
  career: 0.2,
  location: 0.12,
  behavior: 0.13,
  freshness: 0.08,
  quality: 0.12,
  popularity: 0.05,
} as const;

const STOP_WORDS = new Set([
  "a","an","the","to","of","and","or","for","in","on","with","i","want","be","become","my","me","at","as","is",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

/** Build a lowercase keyword "bag" for an opportunity. */
function opportunityKeywords(o: Opportunity): Set<string> {
  const bag = new Set<string>();
  for (const tag of o.tags) bag.add(tag.toLowerCase());
  bag.add(OPPORTUNITY_TYPE_LABEL[o.opportunityType].toLowerCase());
  for (const tok of tokenize(o.title)) bag.add(tok);
  for (const tok of tokenize(o.organization)) bag.add(tok);
  return bag;
}

/** 0–1 interest signal: overlap between user interests and opportunity. */
function interestScore(user: UserProfile, o: Opportunity): number {
  if (!user.interests.length) return 0.5;
  const kw = opportunityKeywords(o);
  let hits = 0;
  for (const interest of user.interests) {
    const words = tokenize(interest);
    if (words.some((w) => kw.has(w))) hits++;
  }
  // Reward overlap but saturate quickly.
  return clamp(hits / Math.min(user.interests.length, 4), 0, 1);
}

/** 0–1 career-goal signal: keyword overlap with stated goals. */
function careerScore(user: UserProfile, o: Opportunity): number {
  if (!user.careerGoals?.trim()) return 0.4;
  const goalTokens = new Set(tokenize(user.careerGoals));
  if (!goalTokens.size) return 0.4;
  const kw = opportunityKeywords(o);
  let hits = 0;
  for (const g of goalTokens) if (kw.has(g)) hits++;
  return clamp(hits / Math.max(2, goalTokens.size * 0.6), 0, 1);
}

/** 0–1 location signal. */
function locationScore(user: UserProfile, o: Opportunity): number {
  if (o.remote || o.country === "Remote / Global") return 0.9;
  if (!user.country) return 0.5;
  if (o.country === user.country) return 1;
  if (o.region && user.region && o.region === user.region) return 0.7;
  return 0.35;
}

/** 0–1 behavior signal from the user's recent activity. */
function behaviorScore(
  o: Opportunity,
  activity: UserActivity[],
  byId: Map<string, Opportunity>,
): number {
  if (!activity.length) return 0.5;
  const kw = opportunityKeywords(o);
  let weightSum = 0;
  let score = 0;
  for (const a of activity.slice(0, 40)) {
    const ref = byId.get(a.opportunityId);
    if (!ref || ref.id === o.id) continue;
    const w = a.actionType === "save" ? 3 : a.actionType === "apply_click" ? 2 : 1;
    const refKw = opportunityKeywords(ref);
    let overlap = 0;
    for (const t of refKw) if (kw.has(t)) overlap++;
    const sim = overlap / Math.max(4, refKw.size);
    score += sim * w;
    weightSum += w;
  }
  if (!weightSum) return 0.5;
  return clamp(score / weightSum, 0, 1);
}

/** 0–1 freshness signal based on createdAt/updatedAt. */
function freshnessScore(o: Opportunity): number {
  const ref = new Date(o.updatedAt || o.createdAt).getTime();
  const days = (Date.now() - ref) / (1000 * 60 * 60 * 24);
  if (days <= 7) return 1;
  if (days <= 30) return 0.8;
  if (days <= 90) return 0.55;
  if (days <= 180) return 0.3;
  return 0.15;
}

/** Build the per-signal breakdown for one opportunity. */
export function scoreBreakdown(
  user: UserProfile,
  o: Opportunity,
  activity: UserActivity[],
  byId: Map<string, Opportunity>,
): MatchBreakdown {
  return {
    interest: interestScore(user, o),
    career: careerScore(user, o),
    location: locationScore(user, o),
    behavior: behaviorScore(o, activity, byId),
    freshness: freshnessScore(o),
    quality: clamp(o.qualityScore / 100, 0, 1),
    popularity: clamp((o.popularity ?? 0) / 1000, 0, 1),
  };
}

/** Human-readable reasons for the match (top contributing signals). */
function reasons(user: UserProfile, o: Opportunity, b: MatchBreakdown): string[] {
  const out: string[] = [];
  if (b.interest >= 0.6) out.push("Matches your interests");
  if (b.career >= 0.5) out.push("Aligned with your goals");
  if (o.country === user.country) out.push(`Available in ${user.country}`);
  else if (o.remote) out.push("Remote / global");
  if (b.freshness >= 0.8) out.push("Recently added");
  if (o.verified) out.push("Verified organization");
  return out.slice(0, 3);
}

/** Final 0–100 match score for a single opportunity. */
export function matchScore(
  user: UserProfile,
  o: Opportunity,
  activity: UserActivity[] = [],
  byId?: Map<string, Opportunity>,
): { score: number; breakdown: MatchBreakdown; reasons: string[] } {
  const index = byId ?? new Map();
  const b = scoreBreakdown(user, o, activity, index);
  const weighted =
    b.interest * WEIGHTS.interest +
    b.career * WEIGHTS.career +
    b.location * WEIGHTS.location +
    b.behavior * WEIGHTS.behavior +
    b.freshness * WEIGHTS.freshness +
    b.quality * WEIGHTS.quality +
    b.popularity * WEIGHTS.popularity;
  // Map to a confident-feeling 0–100 range (most results land 55–99).
  const score = clamp(Math.round(40 + weighted * 60));
  return { score, breakdown: b, reasons: reasons(user, o, b) };
}

/**
 * Rank all opportunities for a user, returning them decorated with a match
 * score and sorted highest-first.
 */
export function rankOpportunities(
  user: UserProfile,
  opportunities: Opportunity[],
  activity: UserActivity[] = [],
): ScoredOpportunity[] {
  const byId = new Map(opportunities.map((o) => [o.id, o]));
  return opportunities
    .map((o) => {
      const { score, reasons: r } = matchScore(user, o, activity, byId);
      return { ...o, matchScore: score, matchReasons: r };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
