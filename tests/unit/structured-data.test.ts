import { describe, expect, it } from "vitest";
import { buildStructuredData } from "@/lib/seo/structuredData";
import { getFallbackSiteData } from "@/lib/public/types";

const SITE = "https://soliefhotel.com";
const graph = (data = getFallbackSiteData()) => buildStructuredData(SITE, data);
const node = (type: string, g = graph()) =>
  (g["@graph"] as Array<Record<string, unknown>>).find((n) => n["@type"] === type)!;

describe("structured data", () => {
  it("emits a linked graph of Hotel, WebSite and FAQPage", () => {
    const g = graph();
    expect(g["@context"]).toBe("https://schema.org");
    expect((g["@graph"] as unknown[]).map((n) => (n as Record<string, string>)["@type"])).toEqual([
      "Hotel",
      "WebSite",
      "FAQPage"
    ]);
    expect((node("WebSite") as Record<string, Record<string, string>>).publisher["@id"]).toBe(
      (node("Hotel") as Record<string, string>)["@id"]
    );
  });

  it("carries the confirmed contact facts", () => {
    const hotel = node("Hotel") as Record<string, string>;
    expect(hotel.telephone).toBe("+998983624949");
    expect(hotel.email).toBe("hsolief@gmail.com");
    expect(hotel.checkinTime).toBe("14:00");
    expect(hotel.checkoutTime).toBe("12:00");
    expect(hotel.url).toBe(SITE);
  });

  it("includes absolute images — Google needs them for hotel rich results", () => {
    const images = (node("Hotel") as Record<string, string[]>).image;
    expect(images.length).toBeGreaterThan(3);
    for (const src of images) expect(src.startsWith(`${SITE}/`)).toBe(true);
    expect(new Set(images).size).toBe(images.length);
  });

  it("offers every priced room with its real price and capacity", () => {
    const offers = (node("Hotel") as Record<string, Array<Record<string, unknown>>>).makesOffer;
    expect(offers).toHaveLength(4);
    const priced = offers.map((o) => [o.price, o.priceCurrency]);
    expect(priced).toEqual([
      [500_000, "UZS"],
      [650_000, "UZS"],
      [700_700, "UZS"],
      [1_000_000, "UZS"]
    ]);
    const room = offers[0].itemOffered as Record<string, Record<string, unknown>>;
    expect(room.occupancy.maxValue).toBe(2);
  });

  it("derives priceRange from the real room prices", () => {
    const hotel = node("Hotel") as Record<string, unknown>;
    expect(hotel.priceRange).toBe("500000–1000000 UZS");
    expect((hotel.priceSpecification as Record<string, number>).minPrice).toBe(500_000);
    expect((hotel.priceSpecification as Record<string, number>).maxPrice).toBe(1_000_000);
  });

  it("publishes the FAQ actually shown on the page", () => {
    const faq = node("FAQPage") as Record<string, Array<Record<string, Record<string, string>>>>;
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(8);
    for (const q of faq.mainEntity) {
      expect(typeof q.name).toBe("string");
      expect((q.name as unknown as string).length).toBeGreaterThan(5);
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(10);
    }
  });

  it("omits the rating entirely when none is configured, rather than inventing one", () => {
    const withRating = node("Hotel") as Record<string, unknown>;
    expect(withRating.aggregateRating).toBeDefined();

    const base = getFallbackSiteData();
    const without = node("Hotel", graph({ ...base, googleRating: null, googleReviewCount: null }));
    expect((without as Record<string, unknown>).aggregateRating).toBeUndefined();
  });

  it("never emits a dead sameAs entry for a social profile the hotel lacks", () => {
    const hotel = node("Hotel") as Record<string, string[]>;
    expect(hotel.sameAs).toContain("https://t.me/soliefhotel");
    for (const url of hotel.sameAs) expect(url).not.toBe("");
  });

  it("states facts we hold and omits the ones we do not", () => {
    const hotel = node("Hotel") as Record<string, unknown>;
    expect(hotel.smokingAllowed).toBe(false);
    expect(hotel.currenciesAccepted).toBe("UZS");
    // Unknown at handover — must not be guessed.
    expect(hotel.starRating).toBeUndefined();
    expect(hotel.numberOfRooms).toBeUndefined();
    expect(hotel.petsAllowed).toBeUndefined();
  });

  it("produces no empty keys or undefined leaves", () => {
    const json = JSON.stringify(graph());
    expect(json).not.toContain("null");
    expect(json).not.toContain('""');
    expect(json).not.toContain("[]");
  });

  it("describes the hotel in prose an AI summary can quote", () => {
    const description = (node("Hotel") as Record<string, string>).description;
    expect(description).toContain("Tashkent");
    expect(description).toContain("Chilanzar");
    expect(description).toContain("breakfast");
    expect(description).toContain("booking request");
    expect(description.length).toBeGreaterThan(200);
  });
});

// /ru and /uz are their own indexable documents, so their structured data has to
// speak their language — an English graph on a Russian page gives Google's AI
// nothing Russian to quote, which is the whole point of having the URL.
describe("structured data per locale", () => {
  // JSON-LD is untyped by nature; naming the few shapes these assertions touch
  // keeps them readable without reaching for `any`.
  type Ref = { "@id": string };
  type Named = { name: string };
  type HotelNode = {
    "@id": string;
    description: string;
    makesOffer: Array<Named & { url: string }>;
    amenityFeature: Named[];
  };
  type FaqNode = Ref & {
    url: string;
    inLanguage: string;
    mainEntity: Named[];
    about: Ref;
    isPartOf: Ref;
  };

  const localized = (locale: "ru" | "uz") =>
    buildStructuredData(SITE, getFallbackSiteData(), locale, `/${locale}`);
  const hotelOf = (g = graph()) => node("Hotel", g) as unknown as HotelNode;
  const faqOf = (g = graph()) => node("FAQPage", g) as unknown as FaqNode;

  it("describes the hotel and its rooms in the language of the page", () => {
    const ru = hotelOf(localized("ru"));
    expect(ru.description).toContain("Ташкента");
    expect(ru.description).toContain("завтрак");
    expect(ru.makesOffer[0].name).toBe("Стандартный двухместный номер");
    expect(ru.amenityFeature[0].name).toBe("Бесплатный Wi-Fi");

    const uz = hotelOf(localized("uz"));
    expect(uz.description).toContain("Toshkent");
    expect(uz.description).toContain("nonushta");
    expect(uz.makesOffer[0].name).toBe("Standart ikki kishilik xona");
  });

  it("answers the FAQ in the page's language and scopes it to that URL", () => {
    for (const locale of ["ru", "uz"] as const) {
      const faq = faqOf(localized(locale));
      expect(faq["@id"]).toBe(`${SITE}/${locale}#faq`);
      expect(faq.url).toBe(`${SITE}/${locale}`);
      expect(faq.inLanguage).toBe(locale);
      expect(faq.mainEntity.length).toBeGreaterThanOrEqual(8);
      // Linked back to the one hotel entity rather than floating free.
      expect(faq.about["@id"]).toBe(`${SITE}/#hotel`);
      expect(faq.isPartOf["@id"]).toBe(`${SITE}/#website`);
    }

    expect(faqOf(localized("ru")).mainEntity[0].name).toContain("заезд");
  });

  it("keeps one Hotel entity across all three URLs", () => {
    const ids = [graph(), localized("ru"), localized("uz")].map((g) => hotelOf(g)["@id"]);
    expect(new Set(ids).size).toBe(1);
    expect(ids[0]).toBe(`${SITE}/#hotel`);
  });

  it("points room offers at the localized page, not the English one", () => {
    expect(hotelOf(localized("ru")).makesOffer[0].url).toBe(`${SITE}/ru#rooms`);
    // The English root must not gain a double slash.
    expect(hotelOf().makesOffer[0].url).toBe(`${SITE}/#rooms`);
  });

  it("emits no empty keys in the localized graphs either", () => {
    for (const locale of ["ru", "uz"] as const) {
      const json = JSON.stringify(localized(locale));
      expect(json).not.toContain("null");
      expect(json).not.toContain('""');
      expect(json).not.toContain("[]");
    }
  });
});
