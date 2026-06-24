import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";
import { getOpportunities } from "@/lib/data/opportunities";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/onboarding"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/login"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/signup"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const opportunities = await getOpportunities();
    const dynamicRoutes: MetadataRoute.Sitemap = opportunities.map((o) => ({
      url: absoluteUrl(`/opportunity/${o.id}`),
      lastModified: new Date(o.updatedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
