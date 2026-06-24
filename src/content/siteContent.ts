import type { Locale } from "@/types";
import { contact } from "./contact";

export const siteConfig = {
  defaultLocale: "en" as Locale,
  demoMode: false,
  showOwnerPitch: false,
  hotelName: "Solief Hotel",
  canonicalUrl: "https://soliefhotel.vercel.app",
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
