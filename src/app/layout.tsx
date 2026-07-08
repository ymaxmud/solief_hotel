import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { siteConfig } from "@/content/siteContent";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.canonicalUrl),
  title: "Solief Hotel Tashkent — A Quiet Boutique Stay in Chilanzar",
  description:
    "A calm, refined boutique hotel in the Chilanzar district of Tashkent. Comfortable rooms, breakfast included, warm hospitality, and direct booking with the hotel team.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/?lang=en",
      ru: "/?lang=ru",
      uz: "/?lang=uz"
    }
  },
  openGraph: {
    title: "Solief Hotel Tashkent — A Quiet Boutique Stay in Chilanzar",
    description:
      "European boutique elegance with the warmth of a family hotel in Tashkent. Comfortable rooms, breakfast included, and direct booking.",
    url: siteConfig.canonicalUrl,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: siteConfig.hotelName,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Naqqoshlik 12",
      postalCode: "100185",
      addressLocality: "Tashkent",
      addressCountry: "UZ"
    },
    telephone: siteConfig.contact.phone,
    hasMap: siteConfig.contact.googleMapsProfileUrl,
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.contact.coordinates.lat,
      longitude: siteConfig.contact.coordinates.lng
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: siteConfig.rating,
      reviewCount: siteConfig.reviewCount
    },
    checkinTime: siteConfig.checkIn,
    checkoutTime: siteConfig.checkOut,
    url: siteConfig.canonicalUrl
  };

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
