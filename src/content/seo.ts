import type { Locale } from "@/types";

/**
 * Per-language search metadata for the three localized homepages.
 *
 * Each locale has its own URL (`/`, `/ru`, `/uz`), so each needs its own title
 * and description written in that language — a translated page that carries an
 * English title competes for the wrong queries and reads as machine output in a
 * result listing. These are hand-written rather than generated so the phrasing
 * matches how people actually search in each language ("гостиница Ташкент",
 * "Toshkentda mehmonxona").
 */

export type LocaleSeo = {
  /** <title> and og:title. */
  title: string;
  /** meta description. */
  description: string;
  /** Shorter, warmer variant for social cards. */
  socialDescription: string;
  /** og:locale. */
  ogLocale: string;
  /** Accessible label for the skip-to-content link. */
  skipToContent: string;
};

export const localeSeo: Record<Locale, LocaleSeo> = {
  en: {
    title: "Solief Hotel Tashkent — A Quiet Boutique Stay in Chilanzar",
    description:
      "A calm, refined boutique hotel in the Chilanzar district of Tashkent. Comfortable rooms, breakfast included, warm hospitality, and direct booking with the hotel team.",
    socialDescription:
      "European boutique elegance with the warmth of a family hotel in Tashkent. Comfortable rooms, breakfast included, and direct booking.",
    ogLocale: "en_US",
    skipToContent: "Skip to content"
  },
  ru: {
    title: "Solief Hotel — бутик-отель в Ташкенте, район Чиланзар",
    description:
      "Спокойный бутик-отель в Чиланзарском районе Ташкента. Комфортные номера, завтрак включён, радушный сервис и бронирование напрямую у отеля.",
    socialDescription:
      "Европейская элегантность бутик-отеля и тепло семейной гостиницы в Ташкенте. Комфортные номера, завтрак включён, прямое бронирование.",
    ogLocale: "ru_RU",
    skipToContent: "Перейти к содержанию"
  },
  uz: {
    title: "Solief Hotel — Toshkent, Chilonzorda butik mehmonxona",
    description:
      "Toshkentning Chilonzor tumanida joylashgan tinch butik mehmonxona. Qulay xonalar, nonushta narxga kiritilgan, iliq mehmondo‘stlik va mehmonxona bilan to‘g‘ridan-to‘g‘ri bron qilish.",
    socialDescription:
      "Toshkentda Yevropa butik uslubi va oilaviy mehmonxona iliqligi. Qulay xonalar, nonushta narxga kiritilgan, to‘g‘ridan-to‘g‘ri bron.",
    ogLocale: "uz_UZ",
    skipToContent: "Asosiy mazmunga o‘tish"
  }
};

/** Path each locale is served from. English keeps the bare root. */
export const localePath: Record<Locale, string> = {
  en: "/",
  ru: "/ru",
  uz: "/uz"
};

/**
 * hreflang map shared by every localized page. `x-default` points at English
 * because that is the canonical root and the fallback for unmatched languages.
 */
export const languageAlternates: Record<string, string> = {
  en: localePath.en,
  ru: localePath.ru,
  uz: localePath.uz,
  "x-default": localePath.en
};
