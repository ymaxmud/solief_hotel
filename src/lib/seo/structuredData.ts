import type { PublicSiteData } from "@/lib/public/types";
import type { Locale } from "@/types";
import { amenities as amenityCatalogue } from "@/content/amenities";
import { faqs } from "@/content/faq";
import { contact } from "@/content/contact";

/**
 * Structured data for the public site.
 *
 * Everything here must be a fact we actually hold: prices and capacities come
 * from the database, amenities from the code catalogue the site renders, and
 * the FAQ entries are the same ones shown on the page. Properties we cannot
 * verify (star rating, pet policy, total room count) are deliberately omitted
 * rather than guessed — invented values are a rich-result penalty risk and
 * would mislead anyone reading an AI summary of the hotel.
 *
 * Emitted as a single @graph so the Hotel, the WebSite and the FAQ are linked
 * entities rather than three unrelated blobs.
 */

const SCHEMA = "https://schema.org";

function hotelDescription(site: PublicSiteData) {
  const cheapest = site.rooms.reduce(
    (min, room) => (room.priceUzs > 0 && room.priceUzs < min ? room.priceUzs : min),
    Number.POSITIVE_INFINITY
  );
  const from = Number.isFinite(cheapest) ? ` Rooms from ${cheapest.toLocaleString("en-US")} UZS per night.` : "";
  return (
    `Solief Hotel is a boutique hotel in the Chilanzar district of Tashkent, Uzbekistan, at ${site.address}. ` +
    `It offers ${site.rooms.length} room categories with breakfast included, free Wi-Fi, air conditioning, ` +
    `private bathrooms, 24/7 reception, laundry and airport transfer on request.${from} ` +
    `Check-in is from ${site.checkIn} and check-out is until ${site.checkOut}. ` +
    `Rooms are reserved by sending a booking request; the hotel confirms availability directly with the guest.`
  );
}

/** Every public image URL we can legitimately point at, absolute. */
function hotelImages(siteUrl: string, site: PublicSiteData) {
  const seen = new Set<string>();
  const out: string[] = [`${siteUrl}/og.jpg`, `${siteUrl}/hero/landing.jpg`];
  for (const room of site.rooms) {
    for (const image of room.images) {
      if (image.src.startsWith("/") && !seen.has(image.src)) {
        seen.add(image.src);
        out.push(`${siteUrl}${image.src}`);
      }
    }
  }
  return out.slice(0, 12);
}

function roomOffers(siteUrl: string, site: PublicSiteData, locale: Locale) {
  return site.rooms
    .filter((room) => room.priceUzs > 0)
    .map((room) => ({
      "@type": "Offer",
      name: room.name[locale],
      description: room.description[locale],
      price: room.priceUzs,
      priceCurrency: "UZS",
      availability: `${SCHEMA}/InStock`,
      url: `${siteUrl}/#rooms`,
      itemOffered: {
        "@type": "HotelRoom",
        name: room.name[locale],
        description: room.description[locale],
        occupancy: { "@type": "QuantitativeValue", maxValue: room.capacity, unitText: "guests" },
        floorSize: { "@type": "QuantitativeValue", value: room.areaSqm, unitCode: "MTK" },
        bed: { "@type": "BedDetails", typeOfBed: room.bedType[locale] },
        image: room.images[0] ? `${siteUrl}${room.images[0].src}` : undefined
      }
    }));
}

function amenityFeatures(site: PublicSiteData) {
  const active = new Set(site.activeAmenityIds);
  return amenityCatalogue
    .filter((amenity) => active.has(amenity.id))
    .map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.title.en,
      value: true
    }));
}

export function buildStructuredData(siteUrl: string, site: PublicSiteData, locale: Locale = "en") {
  const hotelId = `${siteUrl}/#hotel`;
  const prices = site.rooms.map((room) => room.priceUzs).filter((price) => price > 0);
  const low = prices.length ? Math.min(...prices) : null;
  const high = prices.length ? Math.max(...prices) : null;

  // Only social profiles the hotel actually has. Empty entries are dropped so a
  // missing profile never becomes a dead sameAs reference.
  const sameAs = [site.telegramUrl, contact.instagramUrl, contact.facebookUrl, contact.bookingComUrl]
    .filter((url): url is string => Boolean(url));

  const hotel: Record<string, unknown> = {
    "@type": "Hotel",
    "@id": hotelId,
    name: site.hotelName,
    description: hotelDescription(site),
    url: siteUrl,
    image: hotelImages(siteUrl, site),
    logo: `${siteUrl}/icon.svg`,
    telephone: site.phoneE164,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Naqqoshlik 12",
      addressLocality: "Tashkent",
      addressRegion: "Tashkent",
      postalCode: "100185",
      addressCountry: "UZ"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: contact.coordinates.lat,
      longitude: contact.coordinates.lng
    },
    hasMap: site.googleReviewsUrl || site.googleMapsUrl,
    checkinTime: site.checkIn,
    checkoutTime: site.checkOut,
    currenciesAccepted: "UZS",
    // The website takes booking requests only and processes no card payment.
    paymentAccepted: "Cash",
    availableLanguage: [
      { "@type": "Language", name: "English", alternateName: "en" },
      { "@type": "Language", name: "Russian", alternateName: "ru" },
      { "@type": "Language", name: "Uzbek", alternateName: "uz" }
    ],
    // Every room category is non-smoking.
    smokingAllowed: false,
    amenityFeature: amenityFeatures(site),
    makesOffer: roomOffers(siteUrl, site, locale),
    numberOfRooms: undefined
  };

  if (low !== null && high !== null) {
    hotel.priceRange = low === high ? `${low} UZS` : `${low}–${high} UZS`;
    hotel.priceSpecification = {
      "@type": "PriceSpecification",
      minPrice: low,
      maxPrice: high,
      priceCurrency: "UZS"
    };
  }

  // Publish a rating only when a real one is configured. A partial or invented
  // aggregateRating is worse than none at all.
  if (site.googleRating !== null && site.googleReviewCount !== null && site.googleReviewCount > 0) {
    hotel.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: site.googleRating,
      reviewCount: site.googleReviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  if (sameAs.length) hotel.sameAs = sameAs;

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: site.hotelName,
    inLanguage: ["en", "ru", "uz"],
    publisher: { "@id": hotelId }
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question[locale],
      acceptedAnswer: { "@type": "Answer", text: faq.answer[locale] }
    }))
  };

  return prune({ "@context": SCHEMA, "@graph": [hotel, website, faqPage] });
}

/** Drop undefined/empty values so the emitted JSON-LD carries no empty keys. */
function prune<T>(value: T): T {
  if (Array.isArray(value)) {
    const arr = value.map(prune).filter((v) => v !== undefined && v !== null);
    return arr as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = prune(val);
      if (cleaned === undefined || cleaned === null) continue;
      if (Array.isArray(cleaned) && cleaned.length === 0) continue;
      out[key] = cleaned;
    }
    return out as T;
  }
  return value;
}
