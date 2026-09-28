import { notFound } from "next/navigation";
import { getPublicSiteData } from "@/lib/public/siteData";
import { SiteDataProvider } from "@/components/SiteDataProvider";
import { HomePage } from "@/components/sections/HomePage";
import { isIntlLocale } from "@/lib/i18n/routing";

export default async function LocalizedHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isIntlLocale(lang)) notFound();

  const data = await getPublicSiteData();

  return (
    <SiteDataProvider data={data}>
      {/* The route, not the browser, decides the language. */}
      <HomePage locale={lang} />
    </SiteDataProvider>
  );
}
