"use client";

import * as React from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useSavedStore } from "@/stores/saved-store";

/** Syncs the saved store with the current user once on mount / user change. */
export function useSavedHydration() {
  const { user } = useAuth();
  const hydrate = useSavedStore((s) => s.hydrate);
  const hydratedUid = useSavedStore((s) => s.hydratedUid);

  React.useEffect(() => {
    if (user && hydratedUid !== user.uid) {
      hydrate(user.uid);
    }
  }, [user, hydratedUid, hydrate]);
}
