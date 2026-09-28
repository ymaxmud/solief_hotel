import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { languageAlternates, localePath } from "@/content/seo";

// Rendered per request so a server-side SITE_URL override is picked up without
// a rebuild (NEXT_PUBLIC_SITE_URL alone is inlined at build time).
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  // Absolute URLs for the hreflang block — the sitemap has no metadataBase to
  // resolve relative paths against.
  const languages = Object.fromEntries(
    Object.entries(languageAlternates).map(([key, path]) => [key, new URL(path, siteUrl).toString()])
  );

  // The three localized homepages are equal-priority entries, each declaring
  // the same alternate set, so the sitemap states the language relationships as
  // well as the page markup does.
  const homepages = Object.values(localePath).map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 1,
    alternates: { languages }
  }));

  return [
    ...homepages,
    {
      url: new URL("/privacy", siteUrl).toString(),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3
    },
    {
      url: new URL("/terms", siteUrl).toString(),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3
    }
  ];
}
