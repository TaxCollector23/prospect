"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, MapPin, CalendarClock, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchBadge } from "./match-badge";
import { TypeIcon } from "./type-icon";
import { SaveButton } from "./save-button";
import { OPPORTUNITY_TYPE_LABEL } from "@/lib/constants";
import { deadlineLabel } from "@/lib/utils";
import type { Opportunity, ScoredOpportunity } from "@/types";

function isScored(o: Opportunity | ScoredOpportunity): o is ScoredOpportunity {
  return "matchScore" in o;
}

export function OpportunityCard({
  opportunity,
  index = 0,
}: {
  opportunity: Opportunity | ScoredOpportunity;
  index?: number;
}) {
  const o = opportunity;
  const deadline = deadlineLabel(o.deadline);
  const deadlineBadge =
    deadline.tone === "error"
      ? "error"
      : deadline.tone === "warning"
        ? "warning"
        : "muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link href={`/opportunity/${o.id}`} className="group block h-full">
        <Card className="flex h-full flex-col p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TypeIcon type={o.opportunityType} className="h-[18px] w-[18px]" />
              </span>
              <Badge variant="secondary" className="font-normal">
                {OPPORTUNITY_TYPE_LABEL[o.opportunityType]}
              </Badge>
            </div>
            {isScored(o) ? (
              <MatchBadge score={o.matchScore} />
            ) : (
              o.verified && (
                <BadgeCheck className="h-5 w-5 text-primary" aria-label="Verified" />
              )
            )}
          </div>

          <h3 className="mt-4 line-clamp-2 text-base font-semibold leading-snug tracking-tight group-hover:text-primary">
            {o.title}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{o.organization}</span>
            {o.verified && isScored(o) && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            )}
          </div>

          <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {o.shortDescription}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {o.remote ? "Remote" : o.location}
            </span>
            <Badge variant={deadlineBadge} className="gap-1">
              <CalendarClock className="h-3 w-3" />
              {deadline.label}
            </Badge>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs font-medium text-muted-foreground">
              {o.amount ?? "View details"}
            </span>
            <SaveButton opportunityId={o.id} size="icon" variant="ghost" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
