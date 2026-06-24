import type { LocalizedText } from "@/types";

export const reviews: { label: LocalizedText; text: LocalizedText; theme: LocalizedText }[] = [
  {
    label: { en: "Guest trust theme", ru: "Тема доверия гостей", uz: "Mehmon ishonchi mavzusi" },
    text: {
      en: "Guests can quickly understand the room options, location, and direct contact path before sending a request.",
      ru: "Гости быстро видят варианты номеров, расположение и прямой способ связи перед отправкой заявки.",
      uz: "Mehmonlar so‘rov yuborishdan oldin xona variantlari, joylashuv va bevosita aloqa yo‘lini tez ko‘radi."
    },
    theme: { en: "Comfortable rooms", ru: "Комфортные номера", uz: "Qulay xonalar" }
  },
  {
    label: { en: "Booking platform guest", ru: "Гость платформы бронирования", uz: "Bron platformasi mehmoni" },
    text: {
      en: "The website makes it easier for staff to respond to guests with the right room and arrival details.",
      ru: "Сайт помогает команде быстрее отвечать гостям с правильными деталями номера и приезда.",
      uz: "Sayt xodimlarga mehmonlarga xona va kelish tafsilotlari bilan tezroq javob berishga yordam beradi."
    },
    theme: { en: "Helpful staff", ru: "Отзывчивый персонал", uz: "Yordamchi xodimlar" }
  },
  {
    label: { en: "Google profile connected", ru: "Профиль Google подключён", uz: "Google profili ulangan" },
    text: {
      en: "The hotel’s Google Maps profile is connected so guests can verify location, route, and public review signals.",
      ru: "Профиль отеля в Google Maps подключён, чтобы гости могли проверить локацию, маршрут и отзывы.",
      uz: "Mehmonlar joylashuv, yo‘nalish va ommaviy sharh belgilarini tekshirishi uchun Google Maps profili ulangan."
    },
    theme: { en: "Convenient location", ru: "Удобное расположение", uz: "Qulay joylashuv" }
  }
];
