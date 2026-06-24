"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Compass, Sparkles, TrendingUp, SearchX } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useOpportunities } from "@/hooks/use-opportunities";
import { useSavedHydration } from "@/hooks/use-saved-hydration";
import { rankOpportunities } from "@/lib/recommendation";
import { getLocalActivity } from "@/lib/data/activity";
import { DEFAULT_FILTERS, searchLocal, type SearchFilters } from "@/lib/search";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import { OpportunityGridSkeleton } from "@/components/opportunity/opportunity-card-skeleton";
import { FilterBar } from "@/components/opportunity/filter-bar";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { track, EVENTS } from "@/lib/analytics";
import type { ScoredOpportunity } from "@/types";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { opportunities, loading } = useOpportunities();
  useSavedHydration();
  const params = useSearchParams();

  const [filters, setFilters] = React.useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    query: params.get("q") ?? "",
  });

  React.useEffect(() => {
    const q = params.get("q");
    if (q !== null) setFilters((f) => ({ ...f, query: q }));
  }, [params]);

  const ranked: ScoredOpportunity[] = React.useMemo(() => {
    if (!profile || !opportunities.length) return [];
    return rankOpportunities(profile, opportunities, getLocalActivity());
  }, [profile, opportunities]);

  const onChange = (next: Partial<SearchFilters>) => {
    setFilters((f) => ({ ...f, ...next }));
    if (next.query !== undefined && next.query)
      track(EVENTS.search, { query: next.query });
    if (next.types || next.country || next.remoteOnly || next.verifiedOnly)
      track(EVENTS.filter, next);
  };

  const results = React.useMemo(
    () => searchLocal(ranked, filters),
    [ranked, filters],
  );

  const featured = React.useMemo(
    () => ranked.filter((o) => o.featured).slice(0, 3),
    [ranked],
  );

  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const hasQuery =
    filters.query ||
    filters.types.length ||
    filters.country !== "all" ||
    filters.remoteOnly ||
    filters.verifiedOnly;

  return (
    <div className="container-page py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-sm text-primary">
          <Sparkles className="h-4 w-4" />
          <span>Personalized for you</span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {ranked.length} opportunities matched to your interests and goals.
        </p>
        {profile?.interests?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.interests.slice(0, 6).map((i) => (
              <Badge key={i} variant="secondary">
                {i}
              </Badge>
            ))}
          </div>
        ) : null}
      </motion.div>

      {/* Featured */}
      {!loading && featured.length > 0 && !hasQuery && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Top picks for you</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((o, i) => (
              <OpportunityCard key={o.id} opportunity={o} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Filters + results */}
      <section>
        <div className="mb-5">
          <FilterBar
            filters={filters}
            onChange={onChange}
            resultCount={loading ? undefined : results.length}
          />
        </div>

        {loading ? (
          <OpportunityGridSkeleton count={6} />
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((o, i) => (
              <OpportunityCard key={o.id} opportunity={o} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={hasQuery ? SearchX : Compass}
            title={hasQuery ? "No matches found" : "No opportunities yet"}
            description={
              hasQuery
                ? "Try adjusting your search or filters."
                : "Check back soon — new opportunities are added regularly."
            }
            action={
              hasQuery ? (
                <Button
                  variant="outline"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </section>
    </div>
  );
}
