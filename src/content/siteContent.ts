import type { Locale } from "@/types";
import { getSiteUrl } from "@/lib/site";
import { contact } from "./contact";

export const siteConfig = {
  defaultLocale: "en" as Locale,
  showOwnerPitch: false,
  hotelName: "Solief Hotel",
  // Derived from NEXT_PUBLIC_SITE_URL — see src/lib/site.ts.
  canonicalUrl: getSiteUrl(),
  // Launch fallbacks. The live site reads these from the database so the owner
  // can update them in /admin/website without a deploy.
  rating: 4.2,
  reviewCount: 75,
  checkIn: "14:00",
  checkOut: "12:00",
  contact
};

export const nearbyHighlights = [
  { en: "Chilanzar district access", ru: "Доступ к Чиланзарскому району", uz: "Chilonzor tumaniga qulay kirish" },
  { en: "Public transport nearby", ru: "Рядом общественный транспорт", uz: "Yaqinda jamoat transporti" },
  { en: "Local food and shops", ru: "Местная еда и магазины", uz: "Mahalliy ovqatlanish va do‘konlar" },
  { en: "Practical airport access", ru: "Удобный доступ к аэропорту", uz: "Aeroportga qulay qatnov" }
];
