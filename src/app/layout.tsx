import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
  title: "Solief Hotel Tashkent — Cozy Hotel in Chilanzar District",
  description:
    "Book a comfortable stay at Solief Hotel in Tashkent. Cozy rooms, warm service, easy booking request, and convenient location in Chilanzar district.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/?lang=en",
      ru: "/?lang=ru",
      uz: "/?lang=uz"
    }
  },
  openGraph: {
    title: "Solief Hotel Tashkent — Cozy Hotel in Chilanzar District",
    description:
      "Comfortable rooms, warm service, easy booking request, and convenient location in Chilanzar district.",
    url: siteConfig.canonicalUrl,
    siteName: "Solief Hotel",
    images: [{ url: "/og.jpg", width: 1200, height: 588, alt: "Solief Hotel exterior in Chilanzar district, Tashkent" }],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Solief Hotel Tashkent",
    description: "A cozy stay in Tashkent with warm hospitality and easy booking requests.",
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
          className="focus-ring sr-only z-[100] rounded-full bg-coralBase px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </body>
    </html>
  );
}
