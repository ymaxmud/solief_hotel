import type { Room } from "@/types";

export const rooms: Room[] = [
  {
    id: "standard-double",
    name: { en: "Standard Double Room", ru: "Стандартный двухместный номер", uz: "Standart ikki kishilik xona" },
    description: {
      en: "A practical, calm room for couples or solo guests who want simple comfort in Tashkent.",
      ru: "Практичный и спокойный номер для пар или одного гостя, которым нужен простой комфорт в Ташкенте.",
      uz: "Juftliklar yoki yakka mehmonlar uchun Toshkentdagi sodda va qulay xona."
    },
    bestFor: { en: "Couples", ru: "Пары", uz: "Juftliklar" },
    capacity: 2,
    beds: { en: "1 double bed", ru: "1 двуспальная кровать", uz: "1 ikki kishilik karavot" },
    amenities: [
      { en: "Wi-Fi", ru: "Wi-Fi", uz: "Wi-Fi" },
      { en: "Air conditioning", ru: "Кондиционер", uz: "Konditsioner" },
      { en: "Private bathroom", ru: "Собственная ванная", uz: "Alohida hammom" }
    ],
    priceUzs: 449000,
    priceNote: { en: "Confirm final rate with the hotel", ru: "Итоговую цену уточните у отеля", uz: "Yakuniy narxni mehmonxonadan aniqlang" },
    imageId: 30
  },
  {
    id: "standard-twin",
    name: { en: "Standard Twin Room", ru: "Стандартный номер с двумя кроватями", uz: "Standart ikki alohida karavotli xona" },
    description: {
      en: "A comfortable option for colleagues, friends, or guests who prefer separate beds.",
      ru: "Удобный вариант для коллег, друзей или гостей, которым нужны отдельные кровати.",
      uz: "Hamkasblar, do‘stlar yoki alohida karavot xohlovchi mehmonlar uchun qulay tanlov."
    },
    bestFor: { en: "Business trips", ru: "Деловые поездки", uz: "Ish safarlari" },
    capacity: 2,
    beds: { en: "2 single beds", ru: "2 односпальные кровати", uz: "2 bir kishilik karavot" },
    amenities: [
      { en: "Wi-Fi", ru: "Wi-Fi", uz: "Wi-Fi" },
      { en: "Work-friendly layout", ru: "Удобно для работы", uz: "Ishlashga qulay" },
      { en: "Private bathroom", ru: "Собственная ванная", uz: "Alohida hammom" }
    ],
    priceUzs: 449000,
    priceNote: { en: "Confirm final rate with the hotel", ru: "Итоговую цену уточните у отеля", uz: "Yakuniy narxni mehmonxonadan aniqlang" },
    imageId: 23
  },
  {
    id: "standard-triple",
    name: { en: "Standard Triple Room", ru: "Стандартный трёхместный номер", uz: "Standart uch kishilik xona" },
    description: {
      en: "More space for small families or groups arriving together in Tashkent.",
      ru: "Больше места для небольшой семьи или группы, приезжающей вместе в Ташкент.",
      uz: "Toshkentga birga kelgan kichik oila yoki guruh uchun kengroq xona."
    },
    bestFor: { en: "Small families", ru: "Небольшие семьи", uz: "Kichik oilalar" },
    capacity: 3,
    beds: { en: "Flexible beds", ru: "Гибкая расстановка кроватей", uz: "Moslashuvchan karavotlar" },
    amenities: [
      { en: "Wi-Fi", ru: "Wi-Fi", uz: "Wi-Fi" },
      { en: "Air conditioning", ru: "Кондиционер", uz: "Konditsioner" },
      { en: "Family-friendly", ru: "Подходит для семьи", uz: "Oilalar uchun qulay" }
    ],
    priceUzs: 599000,
    priceNote: { en: "Confirm final rate with the hotel", ru: "Итоговую цену уточните у отеля", uz: "Yakuniy narxni mehmonxonadan aniqlang" },
    imageId: 3
  },
  {
    id: "family-quadruple",
    name: { en: "Standard Quadruple / Family Room", ru: "Семейный четырёхместный номер", uz: "Oilaviy to‘rt kishilik xona" },
    description: {
      en: "A practical family room for guests who want to stay together comfortably.",
      ru: "Практичный семейный номер для гостей, которые хотят удобно разместиться вместе.",
      uz: "Birga va qulay joylashishni xohlovchi mehmonlar uchun oilaviy xona."
    },
    bestFor: { en: "Families", ru: "Семьи", uz: "Oilalar" },
    capacity: 4,
    beds: { en: "Family bed setup", ru: "Семейная расстановка", uz: "Oilaviy karavot joylashuvi" },
    amenities: [
      { en: "Wi-Fi", ru: "Wi-Fi", uz: "Wi-Fi" },
      { en: "Private bathroom", ru: "Собственная ванная", uz: "Alohida hammom" },
      { en: "Extra space", ru: "Больше пространства", uz: "Qo‘shimcha joy" }
    ],
    priceUzs: 749000,
    priceNote: { en: "Confirm final rate with the hotel", ru: "Итоговую цену уточните у отеля", uz: "Yakuniy narxni mehmonxonadan aniqlang" },
    imageId: 27
  }
];
