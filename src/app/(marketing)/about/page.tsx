import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  Target,
  ShieldCheck,
  Sparkles,
  Globe2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Prospect connects people with opportunities that accelerate their education, careers, research, entrepreneurship, and personal growth.",
};

const VALUES = [
  {
    icon: Target,
    title: "Tailored discovery",
    body: "A recommendation engine ranks every opportunity by how well it fits your interests, goals, and location.",
  },
  {
    icon: ShieldCheck,
    title: "Quality first",
    body: "Each opportunity is quality-scored and verified organizations are clearly marked, so you can trust what you find.",
  },
  {
    icon: Globe2,
    title: "For everyone",
    body: "Students, professionals, researchers, founders, creators, and career changers — opportunity should be universal.",
  },
  {
    icon: Sparkles,
    title: "Always fresh",
    body: "New scholarships, internships, fellowships, grants, and programs are added continuously.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-grid">
        <div className="container-page py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm text-primary">
            <Compass className="h-4 w-4" /> Our mission
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {APP_TAGLINE}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Prospect connects people with opportunities that accelerate their
            education, careers, research, entrepreneurship, and personal growth —
            helping you discover what you otherwise would never have found.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/onboarding">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Explore opportunities</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <v.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{v.title}</h2>
              <p className="mt-1.5 text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page grid grid-cols-2 gap-8 py-14 text-center md:grid-cols-4">
          {[
            { value: "14+", label: "Opportunity types" },
            { value: "7", label: "Ranking signals" },
            { value: "100%", label: "Quality-scored" },
            { value: "∞", label: "Interests supported" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-semibold tracking-tight text-primary">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 text-center">
        <Users className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          Ready to find your next opportunity?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Set up your profile in under a minute and get a feed tailored to your
          future.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/onboarding">Create your free account</Link>
        </Button>
      </section>
    </div>
  );
}
