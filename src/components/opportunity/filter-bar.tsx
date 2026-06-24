"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  COUNTRIES,
  OPPORTUNITY_TYPES,
  SORT_OPTIONS,
} from "@/lib/constants";
import type { SearchFilters } from "@/lib/search";
import type { OpportunityType } from "@/types";
import { cn } from "@/lib/utils";

export function FilterBar({
  filters,
  onChange,
  resultCount,
}: {
  filters: SearchFilters;
  onChange: (next: Partial<SearchFilters>) => void;
  resultCount?: number;
}) {
  const toggleType = (type: OpportunityType) => {
    const has = filters.types.includes(type);
    onChange({
      types: has
        ? filters.types.filter((t) => t !== type)
        : [...filters.types, type],
    });
  };

  const activeCount =
    filters.types.length +
    (filters.country !== "all" ? 1 : 0) +
    (filters.remoteOnly ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Search by title, organization, tag…"
            className="pl-9"
            aria-label="Search opportunities"
          />
          {filters.query && (
            <button
              onClick={() => onChange({ query: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Types multi-select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </span>
              {activeCount > 0 && (
                <Badge variant="default" className="px-1.5">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-3">
            <p className="px-1 pb-2 text-xs font-medium text-muted-foreground">
              Opportunity type
            </p>
            <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto">
              {OPPORTUNITY_TYPES.map((t) => {
                const active = filters.types.includes(t.value);
                return (
                  <button
                    key={t.value}
                    onClick={() => toggleType(t.value)}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                      active && "bg-primary/10 text-primary",
                    )}
                  >
                    {t.label}
                    {active && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 space-y-3 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="remote-only" className="cursor-pointer">
                  Remote only
                </Label>
                <Switch
                  id="remote-only"
                  checked={filters.remoteOnly}
                  onCheckedChange={(v) => onChange({ remoteOnly: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="verified-only" className="cursor-pointer">
                  Verified only
                </Label>
                <Switch
                  id="verified-only"
                  checked={filters.verifiedOnly}
                  onCheckedChange={(v) => onChange({ verifiedOnly: v })}
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Country */}
        <Select
          value={filters.country}
          onValueChange={(v) => onChange({ country: v })}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by country">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(v) => onChange({ sort: v as SearchFilters["sort"] })}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active chips */}
      {(activeCount > 0 || typeof resultCount === "number") && (
        <div className="flex flex-wrap items-center gap-2">
          {typeof resultCount === "number" && (
            <span className="text-sm text-muted-foreground">
              {resultCount} {resultCount === 1 ? "result" : "results"}
            </span>
          )}
          {filters.types.map((t) => {
            const label =
              OPPORTUNITY_TYPES.find((o) => o.value === t)?.label ?? t;
            return (
              <Badge key={t} variant="secondary" className="gap-1">
                {label}
                <button onClick={() => toggleType(t)} aria-label={`Remove ${label}`}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {filters.country !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.country}
              <button onClick={() => onChange({ country: "all" })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.remoteOnly && (
            <Badge variant="secondary" className="gap-1">
              Remote
              <button onClick={() => onChange({ remoteOnly: false })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.verifiedOnly && (
            <Badge variant="secondary" className="gap-1">
              Verified
              <button onClick={() => onChange({ verifiedOnly: false })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
