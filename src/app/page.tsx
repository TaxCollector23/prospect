"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { LogoMark } from "@/components/brand/logo";

/**
 * Entry point. Routes authenticated, onboarded users to the dashboard and
 * everyone else to onboarding.
 */
export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    if (user && profile?.onboarded) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
  }, [user, profile, loading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <LogoMark className="h-12 w-12 animate-pulse" />
      <p className="text-sm text-muted-foreground">Loading Prospect…</p>
    </div>
  );
}
