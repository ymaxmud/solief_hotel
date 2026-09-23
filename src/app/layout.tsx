import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { contact } from "@/content/contact";
import { getSiteUrl } from "@/lib/site";
import { getPublicSiteData } from "@/lib/public/siteData";

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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Solief Hotel Tashkent — A Quiet Boutique Stay in Chilanzar",
  description:
    "A calm, refined boutique hotel in the Chilanzar district of Tashkent. Comfortable rooms, breakfast included, warm hospitality, and direct booking with the hotel team.",
  alternates: {
    canonical: "/"
  },
  // No hreflang alternates, deliberately.
  //
  // The site is one document whose language is switched in the browser via
  // ?lang=, so the server returns identical HTML for /?lang=en, /?lang=ru and
  // /?lang=uz. Declaring those as language alternates would tell search engines
  // that three distinct localized documents exist when they do not, and Next.js
  // strips the query string from alternates anyway, which would emit three
  // identical links. One canonical URL is the truthful model here. Real
  // per-language URLs would need localized routes, which is a larger change than
  // this production pass should make.
  openGraph: {
    title: "Solief Hotel Tashkent — A Quiet Boutique Stay in Chilanzar",
    description:
      "European boutique elegance with the warmth of a family hotel in Tashkent. Comfortable rooms, breakfast included, and direct booking.",
    url: siteUrl,
    siteName: "Solief Hotel",
    images: [{ url: "/og.jpg", width: 1200, height: 588, alt: "Solief Hotel in Chilanzar district, Tashkent" }],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Solief Hotel Tashkent — Boutique stay in Chilanzar",
    description: "A calm, refined boutique hotel in Tashkent — comfortable rooms, breakfast included, direct booking.",
    images: ["/og.jpg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getPublicSiteData();

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: site.hotelName,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Naqqoshlik 12",
      postalCode: "100185",
      addressLocality: "Tashkent",
      addressCountry: "UZ"
    },
    telephone: site.phoneE164,
    email: site.email,
    hasMap: site.googleReviewsUrl || site.googleMapsUrl,
    geo: {
      "@type": "GeoCoordinates",
      latitude: contact.coordinates.lat,
      longitude: contact.coordinates.lng
    },
    checkinTime: site.checkIn,
    checkoutTime: site.checkOut,
    url: siteUrl
  };

  // Only publish an aggregate rating when the hotel has entered a real one.
  // An invented or partial rating in structured data is a Google penalty risk,
  // so the property is omitted rather than guessed.
  if (site.googleRating !== null && site.googleReviewCount !== null && site.googleReviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: site.googleRating,
      reviewCount: site.googleReviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <a
          href="#top"
          className="focus-ring sr-only z-[100] rounded-full bg-oxford px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
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
