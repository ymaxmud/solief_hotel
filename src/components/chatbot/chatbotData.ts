import type { Locale } from "@/types";
import { contact } from "@/content/contact";
import { rooms } from "@/content/rooms";

export type ChatTopic = "check" | "address" | "phone" | "rooms" | "booking" | "map" | "amenities";

export function getChatAnswer(topic: ChatTopic, locale: Locale) {
  const roomList = rooms.map((room) => room.name[locale]).join(", ");
  const answers: Record<ChatTopic, Record<Locale, string>> = {
    check: {
      en: "Check-in starts at 14:00 and check-out is until 12:00.",
      ru: "Заезд начинается в 14:00, выезд до 12:00.",
      uz: "Kirish 14:00 dan, chiqish 12:00 gacha."
    },
    address: {
      en: `Solief Hotel is located at ${contact.address}.`,
      ru: `Solief Hotel находится по адресу ${contact.address}.`,
      uz: `Solief Hotel manzili: ${contact.address}.`
    },
    phone: {
      en: `You can call the hotel at ${contact.phone}.`,
      ru: `Вы можете позвонить в отель: ${contact.phone}.`,
      uz: `Mehmonxonaga qo‘ng‘iroq: ${contact.phone}.`
    },
    rooms: {
      en: `Room options: ${roomList}.`,
      ru: `Типы номеров: ${roomList}.`,
      uz: `Xona turlari: ${roomList}.`
    },
    booking: {
      en: "Send a booking request and the hotel team will confirm availability. This is not instant confirmation.",
      ru: "Отправьте заявку, и команда отеля подтвердит наличие мест. Это не мгновенное подтверждение.",
      uz: "Band qilish so‘rovini yuboring, jamoa mavjudlikni tasdiqlaydi. Bu darhol tasdiq emas."
    },
    map: {
      en: "Use the map button to open Solief Hotel in Google Maps.",
      ru: "Нажмите кнопку карты, чтобы открыть Solief Hotel в Google Maps.",
      uz: "Solief Hotelni Google Mapsda ochish uchun xarita tugmasidan foydalaning."
    },
    amenities: {
      en: "Key amenities include Wi-Fi, reception, air conditioning, private bathroom, and family room options. Some services should be confirmed by the hotel.",
      ru: "Основные удобства: Wi-Fi, ресепшен, кондиционер, собственная ванная и семейные номера. Некоторые услуги нужно подтвердить у отеля.",
      uz: "Asosiy qulayliklar: Wi-Fi, qabulxona, konditsioner, alohida hammom va oilaviy xonalar. Ayrim xizmatlar mehmonxona bilan tasdiqlanadi."
    }
  };
  return answers[topic][locale];
}
