import type { Opportunity, OpportunityType } from "@/types";
import type { SortOption } from "./constants";

export interface SearchFilters {
  query: string;
  types: OpportunityType[];
  country: string | "all";
  remoteOnly: boolean;
  verifiedOnly: boolean;
  sort: SortOption;
}

export const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  types: [],
  country: "all",
  remoteOnly: false,
  verifiedOnly: false,
  sort: "relevance",
};

/** Levenshtein distance for typo tolerance. */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]!;
      dp[j] = Math.min(
        dp[j]! + 1,
        dp[j - 1]! + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[n]!;
}

/** Fuzzy token match: substring OR small edit distance (typo tolerant). */
function tokenMatches(token: string, haystack: string[]): boolean {
  for (const word of haystack) {
    if (word.includes(token) || token.includes(word)) return true;
    const tol = token.length > 6 ? 2 : token.length > 3 ? 1 : 0;
    if (tol > 0 && editDistance(token, word) <= tol) return true;
  }
  return false;
}

function haystackFor(o: Opportunity): string[] {
  return [
    o.title,
    o.organization,
    o.opportunityType,
    o.location,
    o.country,
    ...(o.tags ?? []),
  ]
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Local, typo-tolerant search + filter + sort. Mirrors the Algolia query shape
 * so it can be swapped for {@link searchAlgolia} when keys are configured.
 */
export function searchLocal<T extends Opportunity & { matchScore?: number }>(
  items: T[],
  filters: SearchFilters,
): T[] {
  const q = filters.query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);

  let result = items.filter((o) => {
    if (filters.types.length && !filters.types.includes(o.opportunityType)) {
      return false;
    }
    if (filters.country !== "all" && o.country !== filters.country) {
      return false;
    }
    if (filters.remoteOnly && !o.remote) return false;
    if (filters.verifiedOnly && !o.verified) return false;

    if (tokens.length) {
      const hay = haystackFor(o);
      // Every token must fuzzily match somewhere.
      return tokens.every((t) => tokenMatches(t, hay));
    }
    return true;
  });

  result = sortItems(result, filters.sort);
  return result;
}

function sortItems<T extends Opportunity & { matchScore?: number }>(
  items: T[],
  sort: SortOption,
): T[] {
  const copy = [...items];
  switch (sort) {
    case "newest":
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "deadline":
      return copy.sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dbb = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return da - dbb;
      });
    case "quality":
      return copy.sort((a, b) => b.qualityScore - a.qualityScore);
    case "relevance":
    default:
      return copy.sort(
        (a, b) =>
          (b.matchScore ?? b.qualityScore) - (a.matchScore ?? a.qualityScore),
      );
  }
}

export const isAlgoliaConfigured = Boolean(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID &&
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY,
);

/**
 * Algolia-backed search. Returns object ids matching the text query; the caller
 * intersects with the local set. Falls back to null when not configured so the
 * UI uses {@link searchLocal}.
 */
export async function searchAlgolia(queryText: string): Promise<string[] | null> {
  if (!isAlgoliaConfigured) return null;
  try {
    const { liteClient } = await import("algoliasearch/lite");
    const client = liteClient(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!,
    );
    const indexName =
      process.env.NEXT_PUBLIC_ALGOLIA_INDEX || "opportunities";
    const { results } = await client.search<{ objectID: string }>({
      requests: [{ indexName, query: queryText, hitsPerPage: 100 }],
    });
    const first = results[0];
    if (first && "hits" in first) {
      return first.hits.map((h) => h.objectID);
    }
    return [];
  } catch (err) {
    console.warn("[search] Algolia error, using local search:", err);
    return null;
  }
}
