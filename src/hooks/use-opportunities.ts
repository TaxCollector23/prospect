"use client";

import * as React from "react";
import { getOpportunities } from "@/lib/data/opportunities";
import type { Opportunity } from "@/types";

/** Loads the opportunity set on the client with loading/error state. */
export function useOpportunities() {
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    getOpportunities()
      .then((data) => {
        if (active) setOpportunities(data);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { opportunities, loading, error };
}
