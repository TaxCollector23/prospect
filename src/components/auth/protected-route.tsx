"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { LogoMark } from "@/components/brand/logo";

/**
 * Guards protected pages. Unauthenticated users are redirected to onboarding;
 * users who haven't finished onboarding are sent to /onboarding. Admin pages
 * can additionally require admin via `requireAdmin`.
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireOnboarded = true,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireOnboarded?: boolean;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/onboarding");
      return;
    }
    if (requireOnboarded && profile && !profile.onboarded) {
      router.replace("/onboarding");
      return;
    }
    if (requireAdmin && !profile?.isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, requireAdmin, requireOnboarded, router]);

  if (loading || !user || (requireAdmin && !profile?.isAdmin)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LogoMark className="h-10 w-10 animate-pulse" />
      </div>
    );
  }

  return <>{children}</>;
}
