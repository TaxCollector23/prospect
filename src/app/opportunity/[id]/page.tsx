"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  MapPin,
  CalendarClock,
  ExternalLink,
  Share2,
  BadgeCheck,
  CheckCircle2,
  ListChecks,
  Banknote,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchBadge } from "@/components/opportunity/match-badge";
import { TypeIcon } from "@/components/opportunity/type-icon";
import { SaveButton } from "@/components/opportunity/save-button";
import { DiscordCard } from "@/components/opportunity/discord-card";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import { EmptyState } from "@/components/empty-state";
import { OpportunityStructuredData } from "@/components/structured-data";
import { useAuth } from "@/components/auth/auth-provider";
import { useOpportunities } from "@/hooks/use-opportunities";
import { logActivity, getLocalActivity } from "@/lib/data/activity";
import { matchScore } from "@/lib/recommendation";
import { OPPORTUNITY_TYPE_LABEL } from "@/lib/constants";
import { deadlineLabel, formatDate } from "@/lib/utils";
import { track, EVENTS } from "@/lib/analytics";
import { Compass } from "lucide-react";

export default function OpportunityPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { profile } = useAuth();
  const { opportunities, loading } = useOpportunities();

  const opportunity = React.useMemo(
    () => opportunities.find((o) => o.id === id) ?? null,
    [opportunities, id],
  );

  React.useEffect(() => {
    if (opportunity && profile) {
      logActivity(profile.uid, opportunity.id, "view");
      track(EVENTS.opportunityView, {
        opportunityId: opportunity.id,
        type: opportunity.opportunityType,
      });
    }
  }, [opportunity, profile]);

  const match = React.useMemo(() => {
    if (!opportunity || !profile) return null;
    const byId = new Map(opportunities.map((o) => [o.id, o]));
    return matchScore(profile, opportunity, getLocalActivity(), byId);
  }, [opportunity, profile, opportunities]);

  const related = React.useMemo(() => {
    if (!opportunity) return [];
    return opportunities
      .filter(
        (o) =>
          o.id !== opportunity.id &&
          (o.opportunityType === opportunity.opportunityType ||
            o.tags.some((t) => opportunity.tags.includes(t))),
      )
      .slice(0, 3);
  }, [opportunity, opportunities]);

  if (loading) return <DetailSkeleton />;

  if (!opportunity) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={Compass}
          title="Opportunity not found"
          description="This opportunity may have been removed or the link is incorrect."
          action={
            <Button asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const o = opportunity;
  const deadline = deadlineLabel(o.deadline);

  const onApply = () => {
    logActivity(profile?.uid ?? null, o.id, "apply_click");
    track(EVENTS.applyClick, { opportunityId: o.id });
  };

  const onShare = async () => {
    const url = window.location.href;
    logActivity(profile?.uid ?? null, o.id, "share");
    track(EVENTS.share, { opportunityId: o.id });
    if (navigator.share) {
      try {
        await navigator.share({ title: o.title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="container-page py-8">
      <OpportunityStructuredData o={o} />
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TypeIcon type={o.opportunityType} className="h-6 w-6" />
              </span>
              <div>
                <Badge variant="secondary">
                  {OPPORTUNITY_TYPE_LABEL[o.opportunityType]}
                </Badge>
                {o.verified && (
                  <Badge variant="success" className="ml-2">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
            </div>
            {match && <MatchBadge score={match.score} size={56} />}
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl text-balance">
            {o.title}
          </h1>
          <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{o.organization}</span>
          </div>

          {match && match.reasons.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {match.reasons.map((r) => (
                <Badge key={r} variant="default">
                  {r}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="my-6" />

          <section className="prose-sm">
            <h2 className="text-lg font-semibold">About this opportunity</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {o.description}
            </p>
          </section>

          {o.requirements && o.requirements.length > 0 && (
            <section className="mt-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ListChecks className="h-5 w-5 text-primary" /> Requirements
              </h2>
              <ul className="mt-3 space-y-2">
                {o.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {o.eligibility && o.eligibility.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold">Eligibility</h2>
              <ul className="mt-3 space-y-2">
                {o.eligibility.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {o.tags.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold">Tags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="p-5">
            <dl className="space-y-4 text-sm">
              <InfoRow icon={CalendarClock} label="Deadline">
                <span
                  className={
                    deadline.tone === "error"
                      ? "text-destructive"
                      : deadline.tone === "warning"
                        ? "text-warning"
                        : ""
                  }
                >
                  {o.deadline ? formatDate(o.deadline) : "Rolling"} · {deadline.label}
                </span>
              </InfoRow>
              <InfoRow icon={MapPin} label="Location">
                {o.remote ? "Remote / Flexible" : o.location}
                <span className="block text-muted-foreground">{o.country}</span>
              </InfoRow>
              {o.amount && (
                <InfoRow icon={Banknote} label="Award">
                  {o.amount}
                </InfoRow>
              )}
            </dl>

            <Separator className="my-5" />

            <div className="space-y-2">
              <Button asChild className="w-full" size="lg" onClick={onApply}>
                <a
                  href={o.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply now <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              {o.websiteUrl && (
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={o.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4" /> Visit website
                  </a>
                </Button>
              )}
              <div className="flex gap-2">
                <SaveButton
                  opportunityId={o.id}
                  withLabel
                  variant="secondary"
                  className="flex-1"
                />
                <Button variant="outline" onClick={onShare} className="flex-1">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          </Card>

          {o.discordServerName && o.discordServerUrl && (
            <DiscordCard
              serverName={o.discordServerName}
              serverUrl={o.discordServerUrl}
            />
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Related opportunities</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <OpportunityCard key={r.id} opportunity={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 font-medium">{children}</dd>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-5 w-16" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="mt-5 h-9 w-3/4" />
          <Skeleton className="mt-3 h-5 w-1/3" />
          <Skeleton className="mt-6 h-40 w-full" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}
