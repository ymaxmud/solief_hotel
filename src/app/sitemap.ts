import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/siteContent";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.canonicalUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteConfig.canonicalUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.1
    }
  ];
}
