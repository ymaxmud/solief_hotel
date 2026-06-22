import type { LocalizedText } from "@/types";

export const reviews: { label: LocalizedText; text: LocalizedText; theme: LocalizedText }[] = [
  {
    label: { en: "Guest review preview", ru: "Пример отзыва гостя", uz: "Mehmon sharhi namunasi" },
    text: {
      en: "Editable excerpt placeholder about comfortable rooms and a practical stay.",
      ru: "Редактируемый пример отзыва о комфортных номерах и практичном проживании.",
      uz: "Qulay xonalar va amaliy turar joy haqida tahrirlanadigan namuna."
    },
    theme: { en: "Comfortable rooms", ru: "Комфортные номера", uz: "Qulay xonalar" }
  },
  {
    label: { en: "Booking platform guest", ru: "Гость платформы бронирования", uz: "Bron platformasi mehmoni" },
    text: {
      en: "Editable placeholder focused on helpful staff and good value.",
      ru: "Редактируемый пример про отзывчивый персонал и хорошую цену.",
      uz: "Xodimlar yordami va yaxshi qiymat haqida tahrirlanadigan namuna."
    },
    theme: { en: "Helpful staff", ru: "Отзывчивый персонал", uz: "Yordamchi xodimlar" }
  },
  {
    label: { en: "Google review excerpt placeholder", ru: "Пример фрагмента Google-отзыва", uz: "Google sharhi namunasi" },
    text: {
      en: "Editable excerpt placeholder about convenient location in Tashkent.",
      ru: "Редактируемый пример про удобное расположение в Ташкенте.",
      uz: "Toshkentdagi qulay joylashuv haqida tahrirlanadigan namuna."
    },
    theme: { en: "Convenient location", ru: "Удобное расположение", uz: "Qulay joylashuv" }
  }
];
