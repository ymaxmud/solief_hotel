import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Rendered per request so a server-side SITE_URL override is picked up without
// a rebuild (NEXT_PUBLIC_SITE_URL alone is inlined at build time).
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 }
  ];
}
