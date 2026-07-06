import type { HotelImage, ImageCategory } from "@/types";

// Category per image, based on what each photo actually shows. Keep this the
// editable source of truth; if you swap the underlying files, re-check these.
const categories: Record<number, ImageCategory> = {
  1: "lobby",
  2: "exterior",
  3: "rooms",
  4: "lobby",
  5: "bathroom",
  6: "lobby",
  7: "bathroom",
  8: "dining",
  9: "amenities",
  10: "details",
  11: "exterior",
  12: "rooms",
  13: "kitchen",
  15: "amenities",
  16: "kitchen",
  17: "lobby",
  22: "amenities",
  23: "rooms",
  24: "kitchen",
  25: "dining",
  26: "kitchen",
  27: "rooms",
  28: "dining",
  29: "kitchen",
  30: "rooms",
  31: "lobby",
  33: "details",
  34: "amenities",
  35: "amenities"
};

// Numeric filenames make this manifest the editable source of truth.
// /images/14.png does not exist; add id 14 here only after the real file exists.
export const missingImageIds = [14];

// Excluded from the public gallery: 18/19/20/21 are dim, low-resolution phone
// snapshots of the buffet (26/16/24/13 cover the same subject far better) and 32
// has a heavy vintage filter inconsistent with the rest of the set.
export const excludedImageIds = [18, 19, 20, 21, 32];

const categoryLabels: Record<ImageCategory, HotelImage["alt"]> = {
  rooms: { en: "guest room", ru: "номер", uz: "mehmon xonasi" },
  exterior: { en: "hotel exterior", ru: "фасад отеля", uz: "mehmonxona tashqi ko‘rinishi" },
  lobby: { en: "lobby and reception", ru: "лобби и ресепшн", uz: "lobbi va qabulxona" },
  bathroom: { en: "private bathroom", ru: "ванная комната", uz: "hammom" },
  dining: { en: "dining area", ru: "обеденная зона", uz: "ovqatlanish zonasi" },
  kitchen: { en: "breakfast spread", ru: "завтрак", uz: "nonushta" },
  amenities: { en: "guest amenities", ru: "удобства для гостей", uz: "mehmon qulayliklari" },
  details: { en: "hotel interior", ru: "интерьер отеля", uz: "mehmonxona ichki ko‘rinishi" }
};

const imageIds = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 22, 23,
  24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 35
];

export const hotelImages: HotelImage[] = imageIds.map((id) => {
  const category = categories[id] || "details";
  const label = categoryLabels[category];
  return {
    id,
    src: `/images/${id}.png`,
    category,
    priority: id === 2,
    alt: {
      en: `Solief Hotel — ${label.en}`,
      ru: `Solief Hotel — ${label.ru}`,
      uz: `Solief Hotel — ${label.uz}`
    }
  };
});

// Dedicated landing/hero photo (not part of the public gallery).
export const heroImage: HotelImage = {
  id: 0,
  src: "/hero/landing.jpg",
  category: "exterior",
  priority: true,
  alt: {
    en: "Solief Hotel building exterior in Chilanzar district, Tashkent",
    ru: "Здание отеля Solief в Чиланзарском районе Ташкента",
    uz: "Toshkent Chilonzor tumanidagi Solief mehmonxonasi binosi"
  }
};
