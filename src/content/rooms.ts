import type { Room, RoomImage } from "@/types";

// Shared common-area photos (breakfast/kitchen zone) appended to each room gallery.
const sharedImages: RoomImage[] = [
  { src: "/rooms/shared/coffee-zone.jpg", alt: { en: "Solief Hotel — guest coffee zone", ru: "Solief Hotel — кофе-зона для гостей", uz: "Solief Hotel — mehmonlar uchun kofe zonasi" } },
  { src: "/rooms/shared/kitchen-bar.jpg", alt: { en: "Solief Hotel — kitchen and breakfast bar", ru: "Solief Hotel — кухня и зона завтрака", uz: "Solief Hotel — oshxona va nonushta bari" } }
];

export const rooms: Room[] = [
  {
    id: "standard-double-twin",
    name: { en: "Standard Double or Twin Room", ru: "Стандартный двухместный номер", uz: "Standart ikki kishilik xona" },
    description: {
      en: "A calm 20 m² room with twin beds, breakfast included and all the everyday comforts — ideal for solo travellers or two guests.",
      ru: "Спокойный номер 20 м² с двумя кроватями, включённым завтраком и всеми повседневными удобствами — идеально для одного или двух гостей.",
      uz: "20 m² tinch xona: ikkita karavot, nonushta va barcha kundalik qulayliklar bilan — yakka yoki ikki mehmon uchun ideal."
    },
    capacity: 2,
    areaSqm: 20,
    bedType: { en: "Twin beds", ru: "Две односпальные кровати", uz: "Ikkita bir kishilik karavot" },
    priceUzs: 500000,
    breakfastIncluded: true,
    freeCancellation: true,
    noCreditCard: true,
    noSmoking: true,
    amenityKeys: ["wifi", "breakfastBuffet", "shower", "slippers", "toiletries", "restroom", "towels", "hairDryer", "toiletPaper", "toothbrush", "ac", "safe", "telephone", "tv", "satellite", "cable", "soundproofing", "smartTv", "wardrobe", "carpet", "workTable", "hanger", "heating", "mosquitoGrid", "trashCans", "outletBed", "laundry", "wakeup", "linens", "cardAccess", "water", "kettle", "kitchenware"],
    images: [
      { src: "/rooms/standard-double-twin/01-room.jpg", alt: { en: "Standard Double or Twin Room at Solief Hotel", ru: "Стандартный двухместный номер в Solief Hotel", uz: "Solief Hoteldagi standart ikki kishilik xona" } },
      ...sharedImages
    ]
  },
  {
    id: "twin-suite",
    name: { en: "Twin Suite", ru: "Твин-люкс", uz: "Tvin-lyuks" },
    description: {
      en: "A spacious 30 m² suite with a double bed and a dining table, giving you extra room to relax after a day in Tashkent.",
      ru: "Просторный люкс 30 м² с двуспальной кроватью и обеденным столом — больше места, чтобы отдохнуть после дня в Ташкенте.",
      uz: "30 m² keng lyuks: ikki kishilik karavot va ovqatlanish stoli bilan — Toshkentdagi kundan so‘ng dam olish uchun qo‘shimcha joy."
    },
    capacity: 2,
    areaSqm: 30,
    bedType: { en: "Double bed", ru: "Двуспальная кровать", uz: "Ikki kishilik karavot" },
    priceUzs: 650000,
    breakfastIncluded: true,
    freeCancellation: true,
    noCreditCard: true,
    noSmoking: true,
    amenityKeys: ["wifi", "breakfastBuffet", "shower", "slippers", "toiletries", "restroom", "towels", "hairDryer", "toiletPaper", "toothbrush", "ac", "safe", "telephone", "tv", "satellite", "cable", "soundproofing", "smartTv", "wardrobe", "carpet", "hanger", "heating", "mosquitoGrid", "trashCans", "outletBed", "laundry", "wakeup", "linens", "cardAccess", "water", "dinnerTable", "kettle"],
    images: [
      { src: "/rooms/twin-suite/01-room.jpg", alt: { en: "Twin Suite at Solief Hotel", ru: "Твин-люкс в Solief Hotel", uz: "Solief Hoteldagi tvin-lyuks" } },
      { src: "/rooms/twin-suite/02-room.jpg", alt: { en: "Twin Suite interior at Solief Hotel", ru: "Интерьер твин-люкса в Solief Hotel", uz: "Solief Hoteldagi tvin-lyuks ichki ko‘rinishi" } },
      { src: "/rooms/twin-suite/03-angle.jpg", alt: { en: "Twin Suite from another angle at Solief Hotel", ru: "Твин-люкс с другого ракурса в Solief Hotel", uz: "Solief Hoteldagi tvin-lyuks boshqa burchakdan" } },
      { src: "/rooms/twin-suite/04-bathroom.jpg", alt: { en: "Twin Suite bathroom at Solief Hotel", ru: "Ванная твин-люкса в Solief Hotel", uz: "Solief Hoteldagi tvin-lyuks hammomi" } },
      ...sharedImages
    ]
  },
  {
    id: "deluxe-triple",
    name: { en: "Deluxe Triple Room", ru: "Делюкс трёхместный номер", uz: "Delyuks uch kishilik xona" },
    description: {
      en: "A bright 30 m² deluxe room with three single beds, made for small groups or families travelling together.",
      ru: "Светлый номер делюкс 30 м² с тремя односпальными кроватями — для небольших групп или семей, путешествующих вместе.",
      uz: "30 m² yorug‘ delyuks xona: uchta bir kishilik karavot bilan — birga sayohat qiladigan kichik guruh yoki oilalar uchun."
    },
    capacity: 3,
    areaSqm: 30,
    bedType: { en: "Three single beds", ru: "Три односпальные кровати", uz: "Uchta bir kishilik karavot" },
    priceUzs: 700700,
    breakfastIncluded: true,
    freeCancellation: true,
    noCreditCard: true,
    noSmoking: true,
    amenityKeys: ["wifi", "breakfastBuffet", "shower", "slippers", "toiletries", "restroom", "towels", "hairDryer", "toiletPaper", "handDryer", "toothbrush", "ac", "safe", "tv", "satellite", "cable", "soundproofing", "smartTv", "wardrobe", "carpet", "hanger", "heating", "trashCans", "outletBed", "laundry", "wakeup", "linens", "cardAccess", "water", "dinnerTable", "kettle"],
    images: [
      { src: "/rooms/deluxe-triple/01-room.jpg", alt: { en: "Deluxe Triple Room at Solief Hotel", ru: "Делюкс трёхместный номер в Solief Hotel", uz: "Solief Hoteldagi delyuks uch kishilik xona" } },
      { src: "/rooms/deluxe-triple/02-room.jpg", alt: { en: "Deluxe Triple Room interior at Solief Hotel", ru: "Интерьер делюкс трёхместного номера в Solief Hotel", uz: "Solief Hoteldagi delyuks uch kishilik xona ichki ko‘rinishi" } },
      { src: "/rooms/deluxe-triple/03-shower.jpg", alt: { en: "Deluxe Triple Room shower at Solief Hotel", ru: "Душ в делюкс трёхместном номере Solief Hotel", uz: "Solief Hoteldagi delyuks uch kishilik xona dushi" } },
      { src: "/rooms/deluxe-triple/04-bathroom.jpg", alt: { en: "Deluxe Triple Room bathroom at Solief Hotel", ru: "Ванная делюкс трёхместного номера Solief Hotel", uz: "Solief Hoteldagi delyuks uch kishilik xona hammomi" } },
      ...sharedImages
    ]
  },
  {
    id: "deluxe-quadruple",
    name: { en: "Deluxe Quadruple Room", ru: "Делюкс четырёхместный номер", uz: "Delyuks to‘rt kishilik xona" },
    description: {
      en: "Our largest 35 m² room with four single beds — comfortable space for families or groups who want to stay together.",
      ru: "Наш самый большой номер 35 м² с четырьмя односпальными кроватями — комфортное пространство для семей или групп.",
      uz: "Eng katta 35 m² xonamiz: to‘rtta bir kishilik karavot bilan — birga qolishni istagan oilalar yoki guruhlar uchun qulay joy."
    },
    capacity: 4,
    areaSqm: 35,
    bedType: { en: "Four single beds", ru: "Четыре односпальные кровати", uz: "To‘rtta bir kishilik karavot" },
    priceUzs: 1000000,
    breakfastIncluded: true,
    freeCancellation: true,
    noCreditCard: true,
    noSmoking: true,
    amenityKeys: ["wifi", "breakfastBuffet", "shower", "slippers", "toiletries", "restroom", "towels", "hairDryer", "toiletPaper", "toothbrush", "ac", "safe", "telephone", "tv", "satellite", "cable", "soundproofing", "smartTv", "wardrobe", "carpet", "hanger", "heating", "mosquitoGrid", "trashCans", "outletBed", "laundry", "wakeup", "linens", "cardAccess", "water", "dinnerTable", "kettle"],
    images: [
      { src: "/rooms/deluxe-quadruple/01-room.jpg", alt: { en: "Deluxe Quadruple Room at Solief Hotel", ru: "Делюкс четырёхместный номер в Solief Hotel", uz: "Solief Hoteldagi delyuks to‘rt kishilik xona" } },
      { src: "/rooms/deluxe-quadruple/02-shower.jpg", alt: { en: "Deluxe Quadruple Room shower at Solief Hotel", ru: "Душ в делюкс четырёхместном номере Solief Hotel", uz: "Solief Hoteldagi delyuks to‘rt kishilik xona dushi" } },
      { src: "/rooms/deluxe-quadruple/03-bathroom.jpg", alt: { en: "Deluxe Quadruple Room bathroom at Solief Hotel", ru: "Ванная делюкс четырёхместного номера Solief Hotel", uz: "Solief Hoteldagi delyuks to‘rt kishilik xona hammomi" } },
      ...sharedImages
    ]
  }
];
