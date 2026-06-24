import {
  GraduationCap,
  Briefcase,
  FlaskConical,
  Award,
  Banknote,
  Trophy,
  Code2,
  Sun,
  Rocket,
  HeartHandshake,
  Mic,
  TrendingUp,
  BookOpen,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { OpportunityType } from "@/types";

export const TYPE_ICON: Record<OpportunityType, LucideIcon> = {
  scholarship: GraduationCap,
  internship: Briefcase,
  research: FlaskConical,
  fellowship: Award,
  grant: Banknote,
  competition: Trophy,
  hackathon: Code2,
  "summer-program": Sun,
  accelerator: Rocket,
  volunteer: HeartHandshake,
  conference: Mic,
  "career-program": TrendingUp,
  educational: BookOpen,
  community: Users,
};

export function TypeIcon({
  type,
  className,
}: {
  type: OpportunityType;
  className?: string;
}) {
  const Icon = TYPE_ICON[type] ?? Award;
  return <Icon className={className} aria-hidden="true" />;
}
