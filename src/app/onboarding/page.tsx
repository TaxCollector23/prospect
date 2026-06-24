"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoogleButton } from "@/components/auth/google-button";
import { useAuth } from "@/components/auth/auth-provider";
import {
  TOTAL_STEPS,
  useOnboardingStore,
} from "@/stores/onboarding-store";
import {
  CAREER_SUGGESTIONS,
  COUNTRIES,
  INTERESTS,
  REFERRAL_SOURCES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const STEP_META = [
  { title: "How did you hear about Prospect?", hint: "This helps us reach more people like you." },
  { title: "What opportunities interest you?", hint: "Pick as many as you like — we'll tailor your feed." },
  { title: "What do you want to become?", hint: "Your goals sharpen our recommendations." },
  { title: "Where are you based?", hint: "Used only to surface relevant local opportunities." },
  { title: "Create your account", hint: "Save your preferences and start exploring." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, completeOnboarding, signInWithGoogle, signUpWithEmail } =
    useAuth();
  const store = useOnboardingStore();
  const [mounted, setMounted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => setMounted(true), []);

  // If already onboarded, skip to dashboard.
  React.useEffect(() => {
    if (mounted && user && profile?.onboarded) router.replace("/dashboard");
  }, [mounted, user, profile, router]);

  React.useEffect(() => {
    if (profile) {
      setName((n) => n || profile.name || "");
      setEmail((e) => e || profile.email || "");
    }
  }, [profile]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LogoMark className="h-10 w-10 animate-pulse" />
      </div>
    );
  }

  const step = store.step;
  const meta = STEP_META[step - 1]!;
  const progress = (step / TOTAL_STEPS) * 100;

  const canContinue = (() => {
    switch (step) {
      case 1:
        return Boolean(store.referralSource);
      case 2:
        return store.interests.length > 0;
      case 3:
        return store.careerGoals.trim().length > 1;
      case 4:
        return Boolean(store.country);
      default:
        return true;
    }
  })();

  const finish = async () => {
    setSubmitting(true);
    try {
      if (!user) {
        // Need an account first (email path). Google handled separately.
        if (!name || !email || !password) {
          toast.error("Please fill in your name, email, and password.");
          setSubmitting(false);
          return;
        }
        await signUpWithEmail(name, email, password);
      }
      await completeOnboarding(
        {
          referralSource: store.referralSource,
          interests: store.interests,
          careerGoals: store.careerGoals,
          country: store.country,
          postalCode: store.postalCode,
        },
        {
          name: name || profile?.name || "Explorer",
          email: email || profile?.email || "explorer@prospect.app",
        },
      );
      store.reset();
      toast.success("You're all set!");
      router.replace("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      await completeOnboarding(
        {
          referralSource: store.referralSource,
          interests: store.interests,
          careerGoals: store.careerGoals,
          country: store.country,
          postalCode: store.postalCode,
        },
        { name: "", email: "" },
      );
      store.reset();
      router.replace("/dashboard");
    } catch {
      toast.error("Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-grid">
      {/* Header */}
      <header className="container-page flex items-center justify-between py-5">
        <Logo href="/" />
        <span className="text-sm text-muted-foreground">
          Step {step} of {TOTAL_STEPS}
        </span>
      </header>

      {/* Progress */}
      <div className="container-page">
        <Progress value={progress} />
      </div>

      {/* Body */}
      <main className="container-page flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-balance">
                  {meta.title}
                </h1>
                <p className="mt-2 text-muted-foreground">{meta.hint}</p>
              </div>

              {step === 1 && <StepReferral />}
              {step === 2 && <StepInterests />}
              {step === 3 && <StepCareer />}
              {step === 4 && <StepLocation />}
              {step === 5 && (
                <StepAccount
                  signedIn={Boolean(user)}
                  name={name}
                  email={email}
                  password={password}
                  setName={setName}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  onGoogle={onGoogle}
                  submitting={submitting}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer controls */}
          <div className="mt-10 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={store.back}
              disabled={step === 1 || submitting}
              className={cn(step === 1 && "invisible")}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button onClick={store.next} disabled={!canContinue} size="lg">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={submitting} size="lg">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Complete & explore
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------- Steps ---------------------------------- */

function StepReferral() {
  const { referralSource, setField } = useOnboardingStore();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {REFERRAL_SOURCES.map((source) => {
        const active = referralSource === source;
        return (
          <button
            key={source}
            onClick={() => setField("referralSource", source)}
            className={cn(
              "rounded-xl border p-4 text-sm font-medium transition-all hover:border-primary/50 hover:bg-accent",
              active
                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                : "border-border",
            )}
          >
            {source}
          </button>
        );
      })}
    </div>
  );
}

function StepInterests() {
  const { interests, toggleInterest } = useOnboardingStore();
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2.5">
        {INTERESTS.map((interest) => {
          const active = interests.includes(interest);
          return (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50 hover:bg-accent",
              )}
            >
              {active && <Check className="h-3.5 w-3.5" />}
              {interest}
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {interests.length} selected
      </p>
    </div>
  );
}

function StepCareer() {
  const { careerGoals, setField } = useOnboardingStore();
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="career">Your goal</Label>
        <Input
          id="career"
          value={careerGoals}
          onChange={(e) => setField("careerGoals", e.target.value)}
          placeholder="e.g. Software Engineer, Founder, Doctor…"
          className="h-12 text-base"
          autoFocus
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {CAREER_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setField("careerGoals", s)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepLocation() {
  const { country, postalCode, setField } = useOnboardingStore();
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="country">
          Country <span className="text-destructive">*</span>
        </Label>
        <Select value={country} onValueChange={(v) => setField("country", v)}>
          <SelectTrigger id="country" className="h-12">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="postal">ZIP / Postal code (optional)</Label>
        <Input
          id="postal"
          value={postalCode}
          onChange={(e) => setField("postalCode", e.target.value)}
          placeholder="e.g. 94016"
          className="h-12"
        />
      </div>
      <div className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          We only use location to recommend relevant opportunities. We do not
          sell personal data.
        </p>
      </div>
    </div>
  );
}

function StepAccount({
  signedIn,
  name,
  email,
  password,
  setName,
  setEmail,
  setPassword,
  onGoogle,
  submitting,
}: {
  signedIn: boolean;
  name: string;
  email: string;
  password: string;
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onGoogle: () => void;
  submitting: boolean;
}) {
  if (signedIn) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="h-6 w-6" />
        </span>
        <p className="mt-3 font-medium">You&apos;re signed in</p>
        <p className="text-sm text-muted-foreground">
          Click &ldquo;Complete &amp; explore&rdquo; to finish setting up your
          personalized feed.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <GoogleButton onClick={onGoogle} loading={submitting} />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            or continue with email
          </span>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ob-name">Name</Label>
        <Input
          id="ob-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ob-email">Email</Label>
        <Input
          id="ob-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ob-password">Password</Label>
        <Input
          id="ob-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>
    </div>
  );
}
