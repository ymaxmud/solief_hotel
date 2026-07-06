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

export type RoomImage = { src: string; alt: LocalizedText };

export type Room = {
  /** Stable slug — also used as the payment/booking room identifier. */
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  /** Suggested maximum number of guests. */
  capacity: number;
  /** Room area in square metres. */
  areaSqm: number;
  bedType: LocalizedText;
  /** Nightly rate in UZS (payment-ready base price). */
  priceUzs: number;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  /** Reservation possible without a credit card. */
  noCreditCard: boolean;
  noSmoking: boolean;
  /** Amenity keys resolved via the amenity registry in content/roomAmenities.ts. */
  amenityKeys: string[];
  images: RoomImage[];
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
