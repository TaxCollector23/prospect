"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const oobCode = params.get("oobCode");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters");
      return;
    }
    if (!isFirebaseConfigured || !auth || !oobCode) {
      toast.success("Password reset (demo mode).");
      router.replace("/login");
      return;
    }
    setLoading(true);
    try {
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password updated. Please sign in.");
      router.replace("/login");
    } catch {
      toast.error("This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Update password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Choose a new password"
      footer={<>Changed your mind? <AuthLink href="/login">Back to sign in</AuthLink></>}
    >
      <React.Suspense
        fallback={
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ResetForm />
      </React.Suspense>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link href="/forgot-password" className="hover:underline">
          Request a new link
        </Link>
      </p>
    </AuthCard>
  );
}
