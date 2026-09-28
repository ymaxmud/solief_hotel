import type { Metadata } from "next";
import "../globals.css";
import { getSiteUrl } from "@/lib/site";
import { SiteShell } from "@/components/layout/SiteShell";
import { languageAlternates, localeSeo } from "@/content/seo";

// Cache rendered pages at the edge instead of rebuilding per request. Owner
// edits call revalidatePath() so they appear immediately; this hourly ceiling
// only exists so a missed invalidation cannot pin stale content forever.
export const revalidate = 3600;

const siteUrl = getSiteUrl();
const seo = localeSeo.en;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: seo.title,
  description: seo.description,
  alternates: {
    canonical: "/",
    // Truthful now that each language has its own URL: /ru and /uz serve
    // Russian and Uzbek HTML rather than this document with a query string.
    languages: languageAlternates
  },
  openGraph: {
    title: seo.title,
    description: seo.socialDescription,
    url: "/",
    siteName: "Solief Hotel",
    images: [{ url: "/og.jpg", width: 1200, height: 588, alt: "Solief Hotel in Chilanzar district, Tashkent" }],
    locale: seo.ogLocale,
    alternateLocale: ["ru_RU", "uz_UZ"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Solief Hotel Tashkent — Boutique stay in Chilanzar",
    description: seo.socialDescription,
    images: ["/og.jpg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell locale="en" pagePath="/">
      {children}
    </SiteShell>
  );
}
