"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { capturePageview, initAnalytics } from "@/lib/analytics";

function PageviewTracker() {
  const pathname = usePathname();
  const search = useSearchParams();

  React.useEffect(() => {
    initAnalytics();
  }, []);

  React.useEffect(() => {
    const url =
      window.location.origin +
      pathname +
      (search.toString() ? `?${search.toString()}` : "");
    capturePageview(url);
  }, [pathname, search]);

  return null;
}

export function AnalyticsProvider() {
  return (
    <React.Suspense fallback={null}>
      <PageviewTracker />
    </React.Suspense>
  );
}
