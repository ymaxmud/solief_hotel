import { getPublicSiteData } from "@/lib/public/siteData";
import { SiteDataProvider } from "@/components/SiteDataProvider";
import { HomePage } from "@/components/sections/HomePage";

export default async function Page() {
  const data = await getPublicSiteData();
  return (
    <SiteDataProvider data={data}>
      <HomePage />
    </SiteDataProvider>
  );
}
