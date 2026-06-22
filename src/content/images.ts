import type { HotelImage, ImageCategory } from "@/types";

const categories: Record<number, ImageCategory> = {
  1: "rooms",
  2: "exterior",
  3: "lobby",
  4: "rooms",
  5: "rooms",
  6: "bathroom",
  7: "dining",
  8: "details",
  9: "amenities",
  10: "rooms",
  11: "bathroom",
  12: "rooms",
  13: "kitchen",
  15: "dining",
  16: "rooms",
  17: "amenities",
  18: "lobby",
  19: "details",
  20: "rooms",
  21: "bathroom",
  22: "rooms",
  23: "dining",
  24: "kitchen",
  25: "amenities",
  26: "details",
  27: "rooms",
  28: "lobby",
  29: "bathroom",
  30: "rooms",
  31: "dining",
  32: "amenities",
  33: "details",
  34: "rooms",
  35: "exterior"
};

// Numeric filenames make this manifest the editable source of truth.
// If /images/2.png is not the exterior facade, change priority to the correct image.
const imageIds = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
];

export const hotelImages: HotelImage[] = imageIds.map((id) => {
  const category = categories[id] || "details";
  return {
    id,
    src: `/images/${id}.png`,
    category,
    priority: id === 2,
    alt: {
      en: `Solief Hotel ${category} photo ${id}`,
      ru: `Фото Solief Hotel: ${category}, ${id}`,
      uz: `Solief Hotel ${category} rasmi ${id}`
    }
  };
});

export const heroImage = hotelImages.find((image) => image.priority) || hotelImages[0];
