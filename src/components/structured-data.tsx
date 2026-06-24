import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { OPPORTUNITY_TYPE_LABEL } from "@/lib/constants";
import type { Opportunity } from "@/types";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Site-wide WebSite + Organization structured data. */
export function SiteStructuredData() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: APP_NAME,
        url: absoluteUrl(),
        description: APP_DESCRIPTION,
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl("/dashboard")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
        publisher: {
          "@type": "Organization",
          name: APP_NAME,
          url: absoluteUrl(),
        },
      }}
    />
  );
}

/** Per-opportunity structured data (modeled as JobPosting-like). */
export function OpportunityStructuredData({ o }: { o: Opportunity }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "EducationalOccupationalProgram",
        name: o.title,
        description: o.shortDescription,
        programType: OPPORTUNITY_TYPE_LABEL[o.opportunityType],
        url: absoluteUrl(`/opportunity/${o.id}`),
        provider: {
          "@type": "Organization",
          name: o.organization,
          ...(o.websiteUrl ? { url: o.websiteUrl } : {}),
        },
        ...(o.deadline
          ? { applicationDeadline: formatDate(o.deadline) }
          : {}),
        ...(o.applicationUrl ? { offers: { "@type": "Offer", url: o.applicationUrl } } : {}),
      }}
    />
  );
}
