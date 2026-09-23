import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Rendered per request so a server-side SITE_URL override is picked up without
// a rebuild (NEXT_PUBLIC_SITE_URL alone is inlined at build time).
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/admin/*", "/staff/attendance"] }],
    sitemap: `${getSiteUrl()}/sitemap.xml`
  };
}
