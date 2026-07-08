import type { Amenity } from "@/types";

// Guest-facing amenities. Only channels/services the hotel actually offers are
// listed — parking and airport transfer are intentionally omitted until the
// owner confirms them, rather than shown with hedging copy.
export const amenities: Amenity[] = [
  { id: "wifi", icon: "Wifi", title: { en: "Free Wi-Fi", ru: "Бесплатный Wi-Fi", uz: "Bepul Wi-Fi" }, description: { en: "Reliable internet access for work, calls, and travel planning.", ru: "Надёжный интернет для работы, звонков и планирования поездок.", uz: "Ish, qo‘ng‘iroqlar va sayohatni rejalashtirish uchun ishonchli internet." } },
  { id: "breakfast", icon: "Coffee", title: { en: "Breakfast included", ru: "Завтрак включён", uz: "Nonushta kiritilgan" }, description: { en: "Breakfast is included, for a simple and comfortable start to the day.", ru: "Завтрак включён — простое и комфортное начало дня.", uz: "Nonushta narxga kiritilgan — kunning sokin va qulay boshlanishi." } },
  { id: "reception", icon: "ConciergeBell", title: { en: "24/7 reception", ru: "Ресепшен 24/7", uz: "24/7 qabulxona" }, description: { en: "The reception team supports arrivals, departures, and guest requests.", ru: "Служба приёма помогает при заезде, выезде и с вопросами гостей.", uz: "Qabul jamoasi kelish, ketish va mehmon so‘rovlarida yordam beradi." } },
  { id: "ac", icon: "Snowflake", title: { en: "Air conditioning", ru: "Кондиционер", uz: "Konditsioner" }, description: { en: "A comfortable indoor climate for warm Tashkent days.", ru: "Комфортный микроклимат в тёплые ташкентские дни.", uz: "Toshkentning issiq kunlari uchun qulay ichki iqlim." } },
  { id: "bathroom", icon: "Bath", title: { en: "Private bathroom", ru: "Собственная ванная", uz: "Alohida hammom" }, description: { en: "Practical private bathroom comfort in every room category.", ru: "Практичная собственная ванная в каждой категории номеров.", uz: "Har bir xona toifasida qulay shaxsiy hammom." } },
  { id: "family", icon: "UsersRound", title: { en: "Family rooms", ru: "Семейные номера", uz: "Oilaviy xonalar" }, description: { en: "Room options suitable for families and small groups.", ru: "Варианты номеров для семей и небольших групп.", uz: "Oilalar va kichik guruhlar uchun mos xonalar." } },
  { id: "kitchen", icon: "Utensils", title: { en: "Dining area", ru: "Зона питания", uz: "Ovqatlanish zonasi" }, description: { en: "Dining and breakfast facilities for a convenient stay.", ru: "Зона питания и завтрака для удобного проживания.", uz: "Qulay yashash uchun ovqatlanish va nonushta zonasi." } },
  { id: "laundry", icon: "Shirt", title: { en: "Laundry", ru: "Прачечная", uz: "Kir yuvish" }, description: { en: "Laundry assistance is available through reception.", ru: "Услуги прачечной доступны через ресепшен.", uz: "Kir yuvish xizmati qabulxona orqali mavjud." } },
  { id: "nonsmoking", icon: "Ban", title: { en: "Non-smoking rooms", ru: "Номера для некурящих", uz: "Chekilmaydigan xonalar" }, description: { en: "A cleaner and calmer stay environment.", ru: "Более чистая и спокойная атмосфера проживания.", uz: "Toza va sokin turar joy muhiti." } }
];
