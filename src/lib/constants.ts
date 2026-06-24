import type { OpportunityType } from "@/types";

export const APP_NAME = "Prospect";
export const APP_TAGLINE = "Discover opportunities tailored to your future.";
export const APP_DESCRIPTION =
  "Prospect helps students, professionals, researchers, founders, and creators discover scholarships, internships, research programs, fellowships, grants, competitions, hackathons, and more — tailored to your goals.";

/** Onboarding Step 1 — referral sources. */
export const REFERRAL_SOURCES = [
  "Friend",
  "School",
  "Teacher",
  "Parent",
  "Search Engine",
  "Social Media",
  "Discord",
  "Hack Club",
  "Other",
] as const;

/** Onboarding Step 2 — interest options. */
export const INTERESTS = [
  "Scholarships",
  "Internships",
  "Research",
  "Hackathons",
  "Fellowships",
  "Grants",
  "Competitions",
  "Startup Programs",
  "Entrepreneurship",
  "Technology",
  "Artificial Intelligence",
  "Science",
  "Engineering",
  "Business",
  "Finance",
  "Design",
  "Medicine",
  "Public Policy",
  "Climate",
  "Education",
] as const;

/** Career goal suggestions (Step 3). */
export const CAREER_SUGGESTIONS = [
  "Software Engineer",
  "Founder",
  "Doctor",
  "Product Designer",
  "Research Scientist",
  "Data Scientist",
  "Lawyer",
] as const;

/** Opportunity types — drive filters, badges, and icons. */
export const OPPORTUNITY_TYPES: {
  value: OpportunityType;
  label: string;
}[] = [
  { value: "scholarship", label: "Scholarship" },
  { value: "internship", label: "Internship" },
  { value: "research", label: "Research Program" },
  { value: "fellowship", label: "Fellowship" },
  { value: "grant", label: "Grant" },
  { value: "competition", label: "Competition" },
  { value: "hackathon", label: "Hackathon" },
  { value: "summer-program", label: "Summer Program" },
  { value: "accelerator", label: "Startup Accelerator" },
  { value: "volunteer", label: "Volunteer" },
  { value: "conference", label: "Conference" },
  { value: "career-program", label: "Career Program" },
  { value: "educational", label: "Educational Program" },
  { value: "community", label: "Community Initiative" },
];

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> =
  Object.fromEntries(
    OPPORTUNITY_TYPES.map((t) => [t.value, t.label]),
  ) as Record<OpportunityType, string>;

/** A curated subset of countries for selectors. */
export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Ireland",
  "Germany",
  "France",
  "Netherlands",
  "Spain",
  "Italy",
  "Switzerland",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Australia",
  "New Zealand",
  "Singapore",
  "Japan",
  "South Korea",
  "China",
  "India",
  "United Arab Emirates",
  "Israel",
  "Brazil",
  "Mexico",
  "Argentina",
  "Nigeria",
  "Kenya",
  "South Africa",
  "Remote / Global",
] as const;

export const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "newest", label: "Newest" },
  { value: "deadline", label: "Deadline Soon" },
  { value: "quality", label: "Highest Quality" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

/** Default notification preferences. */
export const DEFAULT_NOTIFICATIONS = {
  emailAlerts: true,
  weeklyDigest: true,
  newOpportunities: true,
  deadlineReminders: true,
  applicationReminders: false,
};

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/saved", label: "Saved" },
  { href: "/settings", label: "Settings" },
  { href: "/profile", label: "Profile" },
] as const;
