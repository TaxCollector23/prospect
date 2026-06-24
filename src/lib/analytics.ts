import posthog from "posthog-js";

let initialized = false;

export const isAnalyticsEnabled = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY,
);

/** Initialize PostHog on the client (no-op without a key). */
export function initAnalytics() {
  if (initialized || typeof window === "undefined" || !isAnalyticsEnabled) {
    return;
  }
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
  initialized = true;
}

type Props = Record<string, unknown>;

/** Track an analytics event (safe no-op in demo mode). */
export function track(event: string, props?: Props) {
  if (!isAnalyticsEnabled || typeof window === "undefined") {
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics]", event, props ?? "");
    }
    return;
  }
  posthog.capture(event, props);
}

export function identify(id: string, props?: Props) {
  if (!isAnalyticsEnabled || typeof window === "undefined") return;
  posthog.identify(id, props);
}

export function resetAnalytics() {
  if (!isAnalyticsEnabled || typeof window === "undefined") return;
  posthog.reset();
}

export function capturePageview(url: string) {
  if (!isAnalyticsEnabled || typeof window === "undefined") return;
  posthog.capture("$pageview", { $current_url: url });
}

/** Canonical event names. */
export const EVENTS = {
  signUp: "user_signed_up",
  logIn: "user_logged_in",
  onboardingStep: "onboarding_step_completed",
  onboardingComplete: "onboarding_completed",
  opportunityView: "opportunity_viewed",
  opportunitySave: "opportunity_saved",
  opportunityUnsave: "opportunity_unsaved",
  applyClick: "apply_clicked",
  share: "opportunity_shared",
  search: "search_performed",
  filter: "filter_applied",
} as const;
