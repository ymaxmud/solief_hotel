export type Locale = "en" | "ru" | "uz";
export type Currency = "UZS" | "USD" | "EUR";
export type LocalizedText = Record<Locale, string>;

export type ImageCategory =
  | "exterior"
  | "lobby"
  | "rooms"
  | "bathroom"
  | "kitchen"
  | "dining"
  | "amenities"
  | "details";

export type HotelImage = {
  id: number;
  src: string;
  category: ImageCategory;
  priority?: boolean;
  alt: LocalizedText;
};

export type Room = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  bestFor: LocalizedText;
  capacity: number;
  beds: LocalizedText;
  amenities: LocalizedText[];
  priceUzs: number;
  priceNote: LocalizedText;
  imageId: number;
};

export type Amenity = {
  id: string;
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
  placeholder?: boolean;
};

export type FAQ = {
  question: LocalizedText;
  answer: LocalizedText;
};
