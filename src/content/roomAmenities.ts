import type { Locale, LocalizedText } from "@/types";

export type AmenityCategory = "bathroom" | "technology" | "facilities" | "services" | "food";

export type AmenityDef = { category: AmenityCategory; label: LocalizedText };

// Central amenity registry: each room references these by key so translations
// are defined once. Grouped by category for the room detail view.
export const amenityRegistry: Record<string, AmenityDef> = {
  wifi: { category: "technology", label: { en: "Wi-Fi", ru: "Wi-Fi", uz: "Wi-Fi" } },
  telephone: { category: "technology", label: { en: "Telephone", ru: "Телефон", uz: "Telefon" } },
  tv: { category: "technology", label: { en: "Flat-screen TV", ru: "Телевизор с плоским экраном", uz: "Yassi ekranli televizor" } },
  satellite: { category: "technology", label: { en: "Satellite channels", ru: "Спутниковые каналы", uz: "Sun’iy yo‘ldosh kanallari" } },
  cable: { category: "technology", label: { en: "Cable channels", ru: "Кабельные каналы", uz: "Kabel kanallari" } },
  smartTv: { category: "technology", label: { en: "Smart TV", ru: "Смарт-ТВ", uz: "Smart TV" } },

  shower: { category: "bathroom", label: { en: "Shower", ru: "Душ", uz: "Dush" } },
  slippers: { category: "bathroom", label: { en: "Slippers", ru: "Тапочки", uz: "Shippak" } },
  toiletries: { category: "bathroom", label: { en: "Free toiletries", ru: "Бесплатные туалетные принадлежности", uz: "Bepul gigiyena vositalari" } },
  restroom: { category: "bathroom", label: { en: "Private toilet", ru: "Собственный туалет", uz: "Alohida hojatxona" } },
  towels: { category: "bathroom", label: { en: "Towels", ru: "Полотенца", uz: "Sochiqlar" } },
  hairDryer: { category: "bathroom", label: { en: "Hair dryer", ru: "Фен", uz: "Fen" } },
  toiletPaper: { category: "bathroom", label: { en: "Toilet paper", ru: "Туалетная бумага", uz: "Tualet qog‘ozi" } },
  toothbrush: { category: "bathroom", label: { en: "Toothbrush", ru: "Зубная щётка", uz: "Tish cho‘tkasi" } },
  handDryer: { category: "bathroom", label: { en: "Hand dryer", ru: "Сушилка для рук", uz: "Qo‘l quritgich" } },

  ac: { category: "facilities", label: { en: "Air conditioning", ru: "Кондиционер", uz: "Konditsioner" } },
  heating: { category: "facilities", label: { en: "Heating", ru: "Отопление", uz: "Isitish" } },
  safe: { category: "facilities", label: { en: "Safe", ru: "Сейф", uz: "Seyf" } },
  soundproofing: { category: "facilities", label: { en: "Soundproofing", ru: "Звукоизоляция", uz: "Tovush izolyatsiyasi" } },
  wardrobe: { category: "facilities", label: { en: "Wardrobe / closet", ru: "Шкаф / гардероб", uz: "Shkaf / garderob" } },
  carpet: { category: "facilities", label: { en: "Carpet flooring", ru: "Ковровое покрытие", uz: "Gilam qoplama" } },
  workTable: { category: "facilities", label: { en: "Work desk", ru: "Рабочий стол", uz: "Ish stoli" } },
  hanger: { category: "facilities", label: { en: "Clothes hanger", ru: "Вешалка для одежды", uz: "Kiyim ilgichi" } },
  mosquitoGrid: { category: "facilities", label: { en: "Mosquito screen", ru: "Москитная сетка", uz: "Chivin to‘ri" } },
  trashCans: { category: "facilities", label: { en: "Trash cans", ru: "Мусорные корзины", uz: "Chiqindi qutilari" } },
  outletBed: { category: "facilities", label: { en: "Socket near the bed", ru: "Розетка у кровати", uz: "Karavot yonida rozetka" } },
  linens: { category: "facilities", label: { en: "Linens", ru: "Постельное бельё", uz: "Choyshablar" } },
  cardAccess: { category: "facilities", label: { en: "Electronic key card access", ru: "Электронный карточный доступ", uz: "Elektron karta bilan kirish" } },

  laundry: { category: "services", label: { en: "Laundry (extra charge)", ru: "Прачечная (за доплату)", uz: "Kir yuvish (qo‘shimcha to‘lov)" } },
  wakeup: { category: "services", label: { en: "Wake-up service", ru: "Услуга побудки", uz: "Uyg‘otish xizmati" } },

  breakfastBuffet: { category: "food", label: { en: "Restaurant buffet breakfast", ru: "Завтрак «шведский стол»", uz: "Restoran bufet nonushtasi" } },
  water: { category: "food", label: { en: "Bottled water", ru: "Бутилированная вода", uz: "Shishadagi suv" } },
  kettle: { category: "food", label: { en: "Electric kettle", ru: "Электрочайник", uz: "Elektr choynak" } },
  kitchenware: { category: "food", label: { en: "Kitchenware", ru: "Кухонная утварь", uz: "Oshxona anjomlari" } },
  dinnerTable: { category: "food", label: { en: "Dining table", ru: "Обеденный стол", uz: "Ovqatlanish stoli" } }
};

export const amenityCategoryOrder: AmenityCategory[] = ["bathroom", "technology", "facilities", "services", "food"];

export const amenityCategoryLabels: Record<AmenityCategory, LocalizedText> = {
  bathroom: { en: "Bathroom", ru: "Ванная комната", uz: "Hammom" },
  technology: { en: "Technology", ru: "Техника", uz: "Texnika" },
  facilities: { en: "Facilities", ru: "Удобства", uz: "Qulayliklar" },
  services: { en: "Services", ru: "Услуги", uz: "Xizmatlar" },
  food: { en: "Food & beverages", ru: "Еда и напитки", uz: "Ovqat va ichimliklar" }
};

export function amenityLabel(key: string, locale: Locale): string {
  return amenityRegistry[key]?.label[locale] ?? key;
}

/** Resolve a room's amenity keys into ordered, category-grouped, localized labels. */
export function groupRoomAmenities(keys: string[], locale: Locale) {
  return amenityCategoryOrder
    .map((category) => ({
      category,
      label: amenityCategoryLabels[category][locale],
      items: keys
        .filter((key) => amenityRegistry[key]?.category === category)
        .map((key) => amenityLabel(key, locale))
    }))
    .filter((group) => group.items.length > 0);
}
