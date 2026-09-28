import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Locale } from "@/types";
import { getSiteUrl } from "@/lib/site";
import { getPublicSiteData } from "@/lib/public/siteData";
import { buildStructuredData } from "@/lib/seo/structuredData";
import { localeSeo } from "@/content/seo";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap"
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap"
});

/**
 * The single <html>/<body> document for every public route.
 *
 * English lives at `/` and Russian and Uzbek at `/ru` and `/uz`, which are
 * separate root layouts because only a root layout can set `<html lang>` — and
 * that attribute has to be correct in the server HTML, not patched in after
 * hydration, both for screen readers and so search engines see the right
 * language without running JavaScript. Those root layouts stay one line each by
 * delegating everything here, so the fonts, skip link, structured data and
 * telemetry have exactly one definition.
 */
export async function SiteShell({
  locale,
  pagePath,
  children
}: {
  locale: Locale;
  /** Path this document is served from — drives the page-scoped structured data. */
  pagePath: string;
  children: React.ReactNode;
}) {
  const site = await getPublicSiteData();
  const schema = buildStructuredData(getSiteUrl(), site, locale, pagePath);

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <a
          href="#top"
          className="focus-ring sr-only z-[100] rounded-full bg-oxford px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {localeSeo[locale].skipToContent}
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {/* Same-origin (/_vercel/*) telemetry — covered by the existing CSP. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
