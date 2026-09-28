import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../globals.css";
import type { Locale } from "@/types";
import { getSiteUrl } from "@/lib/site";
import { SiteShell } from "@/components/layout/SiteShell";
import { INTL_LOCALES, isIntlLocale } from "@/lib/i18n/routing";
import { languageAlternates, localeSeo } from "@/content/seo";

// Same edge-caching contract as the English root — see (en)/layout.tsx.
export const revalidate = 3600;

// Prerender /ru and /uz at build time. dynamicParams is deliberately left at its
// default (true): setting it to false makes these pages 404 permanently the
// first time an owner edit calls revalidatePath, because dropping the
// prerendered entry leaves Next.js unable to regenerate a param it is forbidden
// to render on demand. Unknown locales are rejected by the isIntlLocale guard
// below instead, which 404s /de without rendering English at a foreign URL.
export function generateStaticParams() {
  return INTL_LOCALES.map((lang) => ({ lang }));
}

const siteUrl = getSiteUrl();

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isIntlLocale(lang)) return {};
  const seo = localeSeo[lang];
  const path = `/${lang}`;

  return {
    metadataBase: new URL(siteUrl),
    title: seo.title,
    description: seo.description,
    alternates: {
      // Self-canonical: this page is the canonical home of its language, not a
      // duplicate of the English root.
      canonical: path,
      languages: languageAlternates
    },
    openGraph: {
      title: seo.title,
      description: seo.socialDescription,
      url: path,
      siteName: "Solief Hotel",
      images: [{ url: "/og.jpg", width: 1200, height: 588, alt: "Solief Hotel, Tashkent" }],
      locale: seo.ogLocale,
      alternateLocale: Object.values(localeSeo)
        .map((entry) => entry.ogLocale)
        .filter((value) => value !== seo.ogLocale),
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.socialDescription,
      images: ["/og.jpg"]
    },
    robots: { index: true, follow: true }
  };
}

export default async function IntlRootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isIntlLocale(lang)) notFound();

  return (
    <SiteShell locale={lang as Locale} pagePath={`/${lang}`}>
      {children}
    </SiteShell>
  );
}
