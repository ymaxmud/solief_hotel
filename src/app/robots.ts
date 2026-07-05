import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/siteContent";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/admin/*", "/staff/attendance"] }],
    sitemap: `${siteConfig.canonicalUrl}/sitemap.xml`
  };
}
