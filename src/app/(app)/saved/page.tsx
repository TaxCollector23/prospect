"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, Search, X } from "lucide-react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { useSavedHydration } from "@/hooks/use-saved-hydration";
import { useSavedStore } from "@/stores/saved-store";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import { OpportunityGridSkeleton } from "@/components/opportunity/opportunity-card-skeleton";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, type SortOption } from "@/lib/constants";
import { searchLocal, DEFAULT_FILTERS } from "@/lib/search";

export default function SavedPage() {
  const { opportunities, loading } = useOpportunities();
  useSavedHydration();
  const ids = useSavedStore((s) => s.ids);

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortOption>("newest");

  const saved = React.useMemo(
    () => opportunities.filter((o) => ids.includes(o.id)),
    [opportunities, ids],
  );

  const results = React.useMemo(
    () => searchLocal(saved, { ...DEFAULT_FILTERS, query, sort }),
    [saved, query, sort],
  );

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Saved</h1>
        <p className="mt-1 text-muted-foreground">
          {saved.length} {saved.length === 1 ? "opportunity" : "opportunities"}{" "}
          saved for later.
        </p>
      </div>

      {saved.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved…"
              className="pl-9"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.filter((s) => s.value !== "relevance").map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <OpportunityGridSkeleton count={3} />
      ) : saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved opportunities yet"
          description="Tap the bookmark on any opportunity to save it here for later."
          action={
            <Button asChild>
              <Link href="/dashboard">Explore opportunities</Link>
            </Button>
          }
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches in your saved list"
          description="Try a different search term."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((o, i) => (
            <OpportunityCard key={o.id} opportunity={o} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
