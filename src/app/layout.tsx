import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/content/siteContent";

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
    images: [{ url: "/images/2.png", width: 2075, height: 1018, alt: "Solief Hotel exterior" }],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Solief Hotel Tashkent",
    description: "A cozy stay in Tashkent with warm hospitality and easy booking requests.",
    images: ["/images/2.png"]
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
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </body>
    </html>
  );
}
