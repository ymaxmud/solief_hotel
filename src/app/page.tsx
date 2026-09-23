import { getPublicSiteData } from "@/lib/public/siteData";
import { SiteDataProvider } from "@/components/SiteDataProvider";
import { HomePage } from "@/components/sections/HomePage";

// Owner-editable settings are read per request so a change in /admin/website is
// live immediately, without a redeploy.
export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getPublicSiteData();
  return (
    <SiteDataProvider data={data}>
      <HomePage />
    </SiteDataProvider>
  );
}
