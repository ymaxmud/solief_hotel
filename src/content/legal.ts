import type { Locale } from "@/types";
import { contact } from "@/content/contact";

// NOTE: This is a practical, plain-language template tailored to how the site
// actually processes data. It is NOT legal advice — the hotel owner should have
// it reviewed by a qualified lawyer for Uzbekistan (and any other target market)
// before relying on it. Update `lastUpdated` when the text changes.
const LAST_UPDATED = "2026-07-06";

type Section = { heading: string; body: string[] };
type LegalDoc = { title: string; intro: string; sections: Section[] };

type LegalBundle = {
  ui: { backHome: string; lastUpdated: string; privacy: string; terms: string };
  cookie: { text: string; accept: string; more: string };
  bookingConsent: { before: string; link: string; after: string };
  privacy: LegalDoc;
  terms: LegalDoc;
};

export const legalLastUpdated = LAST_UPDATED;

export const legalContent: Record<Locale, LegalBundle> = {
  en: {
    ui: { backHome: "Back to home", lastUpdated: "Last updated", privacy: "Privacy Policy", terms: "Terms of Service" },
    cookie: {
      text: "We use essential cookies to run this site (language preference and spam protection) and load an embedded Google Map. We do not use advertising trackers.",
      accept: "Got it",
      more: "Privacy Policy"
    },
    bookingConsent: { before: "By submitting, you agree to our ", link: "Privacy Policy", after: "." },
    privacy: {
      title: "Privacy Policy",
      intro: `This policy explains how Solief Hotel (${contact.address}) collects and uses your personal data when you send a booking request or browse this website. Questions: ${contact.email}.`,
      sections: [
        {
          heading: "What we collect",
          body: [
            "Booking request details you provide: full name, phone number and/or email, check-in and check-out dates, number of guests, room type, preferred language and contact method, and any message.",
            "Limited technical data used only to prevent spam and abuse: IP address, browser user-agent, and anti-bot challenge results."
          ]
        },
        {
          heading: "Why we use it",
          body: [
            "To respond to your booking request and arrange your stay.",
            "To protect the site from automated abuse and rate-limit repeated submissions.",
            "We do not sell your data or use it for advertising."
          ]
        },
        {
          heading: "Service providers",
          body: [
            "Supabase (database hosting) stores your booking request.",
            "Vercel hosts the website.",
            "Cloudflare Turnstile provides anti-bot protection.",
            "Google Maps powers the embedded location map.",
            "Resend delivers booking notification emails to the hotel.",
            "These providers process data only to deliver their service to us."
          ]
        },
        {
          heading: "Cookies and local storage",
          body: [
            "We store your language and currency preference and a record that you have seen the cookie notice, in your browser's local storage.",
            "The embedded Google Map and Turnstile widget may set their own cookies when loaded."
          ]
        },
        {
          heading: "Retention",
          body: [
            "Booking request data is kept for as long as needed to handle your request and stay, and for reasonable record-keeping, after which it is deleted.",
            "You can ask us to delete your data at any time."
          ]
        },
        {
          heading: "Your rights and contact",
          body: [
            `To access, correct, or delete your personal data, contact us at ${contact.email} or ${contact.phone}.`,
            "We will respond within a reasonable time."
          ]
        }
      ]
    },
    terms: {
      title: "Terms of Service",
      intro: "These terms govern your use of the Solief Hotel website and the booking request feature.",
      sections: [
        {
          heading: "Booking requests are requests, not confirmed reservations",
          body: [
            "Submitting the form sends a request only. A room is not reserved until the hotel confirms availability and details with you directly by phone, email, or messaging."
          ]
        },
        {
          heading: "Accuracy of information",
          body: [
            "Room prices, amenities, and availability shown on this site are indicative and should be confirmed with the hotel before arrival. We work to keep information accurate but do not guarantee it is error-free."
          ]
        },
        {
          heading: "Acceptable use",
          body: [
            "Do not submit false information, attempt to disrupt the site, or use automated tools to flood the booking form."
          ]
        },
        {
          heading: "External links and services",
          body: [
            "This site links to and embeds third-party services such as Google Maps. We are not responsible for the content or policies of those services."
          ]
        },
        {
          heading: "Limitation of liability",
          body: [
            "The website is provided on an “as is” basis. To the extent permitted by law, Solief Hotel is not liable for indirect or incidental damages arising from use of the site."
          ]
        },
        {
          heading: "Governing law and contact",
          body: [
            `These terms are governed by the laws of the Republic of Uzbekistan. Questions: ${contact.email}, ${contact.phone}.`
          ]
        }
      ]
    }
  },
  ru: {
    ui: { backHome: "На главную", lastUpdated: "Обновлено", privacy: "Политика конфиденциальности", terms: "Условия использования" },
    cookie: {
      text: "Мы используем необходимые файлы cookie для работы сайта (язык и защита от спама) и загружаем встроенную карту Google. Рекламные трекеры не используются.",
      accept: "Понятно",
      more: "Политика конфиденциальности"
    },
    bookingConsent: { before: "Отправляя форму, вы соглашаетесь с ", link: "Политикой конфиденциальности", after: "." },
    privacy: {
      title: "Политика конфиденциальности",
      intro: `Эта политика описывает, как отель Solief (${contact.address}) собирает и использует ваши персональные данные при отправке заявки на бронирование или при посещении сайта. Вопросы: ${contact.email}.`,
      sections: [
        {
          heading: "Какие данные мы собираем",
          body: [
            "Данные заявки, которые вы указываете: имя, телефон и/или e-mail, даты заезда и выезда, число гостей, тип номера, предпочитаемый язык и способ связи, а также сообщение.",
            "Ограниченные технические данные только для защиты от спама: IP-адрес, данные браузера (user-agent) и результаты проверки на бота."
          ]
        },
        {
          heading: "Зачем мы их используем",
          body: [
            "Чтобы ответить на вашу заявку и организовать проживание.",
            "Чтобы защитить сайт от автоматических злоупотреблений и ограничить повторные отправки.",
            "Мы не продаём ваши данные и не используем их для рекламы."
          ]
        },
        {
          heading: "Поставщики услуг",
          body: [
            "Supabase (хостинг базы данных) хранит вашу заявку.",
            "Vercel обеспечивает хостинг сайта.",
            "Cloudflare Turnstile обеспечивает защиту от ботов.",
            "Google Maps используется для встроенной карты.",
            "Resend доставляет письма-уведомления отелю.",
            "Эти поставщики обрабатывают данные только для оказания услуги нам."
          ]
        },
        {
          heading: "Файлы cookie и локальное хранилище",
          body: [
            "Мы сохраняем ваш выбор языка и валюты, а также отметку о показе уведомления о cookie в локальном хранилище браузера.",
            "Встроенная карта Google и виджет Turnstile могут устанавливать собственные файлы cookie при загрузке."
          ]
        },
        {
          heading: "Срок хранения",
          body: [
            "Данные заявки хранятся столько, сколько необходимо для обработки заявки и проживания и для разумного учёта, после чего удаляются.",
            "Вы можете в любой момент попросить удалить ваши данные."
          ]
        },
        {
          heading: "Ваши права и контакты",
          body: [
            `Для доступа, исправления или удаления ваших данных свяжитесь с нами: ${contact.email} или ${contact.phone}.`,
            "Мы ответим в разумный срок."
          ]
        }
      ]
    },
    terms: {
      title: "Условия использования",
      intro: "Эти условия регулируют использование сайта отеля Solief и функции заявки на бронирование.",
      sections: [
        {
          heading: "Заявка — это запрос, а не подтверждённое бронирование",
          body: [
            "Отправка формы — это только запрос. Номер не считается забронированным, пока отель напрямую не подтвердит наличие и детали по телефону, e-mail или в мессенджере."
          ]
        },
        {
          heading: "Точность информации",
          body: [
            "Цены, удобства и наличие номеров на сайте являются ориентировочными и должны быть подтверждены отелем до заезда. Мы стремимся к точности, но не гарантируем отсутствие ошибок."
          ]
        },
        {
          heading: "Допустимое использование",
          body: [
            "Не указывайте ложные данные, не пытайтесь нарушить работу сайта и не используйте автоматические средства для массовой отправки формы."
          ]
        },
        {
          heading: "Внешние ссылки и сервисы",
          body: [
            "Сайт ссылается на сторонние сервисы, такие как Google Maps, и встраивает их. Мы не отвечаем за их содержание и политику."
          ]
        },
        {
          heading: "Ограничение ответственности",
          body: [
            "Сайт предоставляется «как есть». В пределах, допустимых законом, отель Solief не несёт ответственности за косвенный или случайный ущерб от использования сайта."
          ]
        },
        {
          heading: "Применимое право и контакты",
          body: [
            `Эти условия регулируются законодательством Республики Узбекистан. Вопросы: ${contact.email}, ${contact.phone}.`
          ]
        }
      ]
    }
  },
  uz: {
    ui: { backHome: "Bosh sahifaga", lastUpdated: "Yangilangan", privacy: "Maxfiylik siyosati", terms: "Foydalanish shartlari" },
    cookie: {
      text: "Saytni ishlatish uchun zarur cookie-fayllardan (til va spamdan himoya) foydalanamiz va Google xaritasini yuklaymiz. Reklama kuzatuvchilaridan foydalanmaymiz.",
      accept: "Tushunarli",
      more: "Maxfiylik siyosati"
    },
    bookingConsent: { before: "Yuborish orqali siz ", link: "Maxfiylik siyosatiga", after: " rozilik bildirasiz." },
    privacy: {
      title: "Maxfiylik siyosati",
      intro: `Ushbu siyosat Solief mehmonxonasi (${contact.address}) siz bron so‘rovini yuborganingizda yoki saytga tashrif buyurganingizda shaxsiy ma’lumotlaringizni qanday yig‘ishi va ishlatishini tushuntiradi. Savollar: ${contact.email}.`,
      sections: [
        {
          heading: "Qanday ma’lumot yig‘amiz",
          body: [
            "Siz kiritadigan so‘rov ma’lumotlari: ism, telefon va/yoki e-mail, kelish va ketish sanalari, mehmonlar soni, xona turi, afzal til va aloqa usuli hamda xabar.",
            "Faqat spamning oldini olish uchun cheklangan texnik ma’lumotlar: IP-manzil, brauzer (user-agent) va botga qarshi tekshiruv natijalari."
          ]
        },
        {
          heading: "Nima uchun ishlatamiz",
          body: [
            "So‘rovingizga javob berish va turar joyingizni tashkil qilish uchun.",
            "Saytni avtomatik suiiste’moldan himoya qilish va takroriy yuborishlarni cheklash uchun.",
            "Biz ma’lumotlaringizni sotmaymiz va reklama uchun ishlatmaymiz."
          ]
        },
        {
          heading: "Xizmat ko‘rsatuvchilar",
          body: [
            "Supabase (ma’lumotlar bazasi hostingi) so‘rovingizni saqlaydi.",
            "Vercel saytni joylashtiradi.",
            "Cloudflare Turnstile botlardan himoya qiladi.",
            "Google Maps o‘rnatilgan xaritani ta’minlaydi.",
            "Resend mehmonxonaga bildirishnoma xatlarini yetkazadi.",
            "Bu ta’minotchilar ma’lumotni faqat bizga xizmat ko‘rsatish uchun qayta ishlaydi."
          ]
        },
        {
          heading: "Cookie va lokal xotira",
          body: [
            "Til va valyuta tanlovingizni hamda cookie bildirishnomasini ko‘rganingiz haqidagi belgini brauzeringiz lokal xotirasida saqlaymiz.",
            "O‘rnatilgan Google xaritasi va Turnstile vidjeti yuklanganda o‘z cookie-fayllarini o‘rnatishi mumkin."
          ]
        },
        {
          heading: "Saqlash muddati",
          body: [
            "So‘rov ma’lumotlari so‘rov va turar joyni ko‘rib chiqish hamda oqilona hisob-kitob uchun zarur bo‘lgan muddat davomida saqlanadi, so‘ng o‘chiriladi.",
            "Istalgan vaqtda ma’lumotlaringizni o‘chirishni so‘rashingiz mumkin."
          ]
        },
        {
          heading: "Huquqlaringiz va aloqa",
          body: [
            `Shaxsiy ma’lumotlaringizni ko‘rish, tuzatish yoki o‘chirish uchun biz bilan bog‘laning: ${contact.email} yoki ${contact.phone}.`,
            "Biz oqilona muddatda javob beramiz."
          ]
        }
      ]
    },
    terms: {
      title: "Foydalanish shartlari",
      intro: "Ushbu shartlar Solief mehmonxonasi sayti va bron so‘rovi funksiyasidan foydalanishni tartibga soladi.",
      sections: [
        {
          heading: "So‘rov — bu tasdiqlangan bron emas",
          body: [
            "Formani yuborish faqat so‘rovdir. Mehmonxona telefon, e-mail yoki messenjer orqali mavjudlik va tafsilotlarni to‘g‘ridan-to‘g‘ri tasdiqlamaguncha xona band qilinmaydi."
          ]
        },
        {
          heading: "Ma’lumot aniqligi",
          body: [
            "Saytdagi narxlar, qulayliklar va mavjudlik taxminiy bo‘lib, kelishdan oldin mehmonxona bilan tasdiqlanishi kerak. Biz aniqlikka intilamiz, ammo xatosizlikni kafolatlamaymiz."
          ]
        },
        {
          heading: "Maqbul foydalanish",
          body: [
            "Yolg‘on ma’lumot kiritmang, sayt ishini buzishga urinmang va formani ommaviy yuborish uchun avtomatik vositalardan foydalanmang."
          ]
        },
        {
          heading: "Tashqi havolalar va xizmatlar",
          body: [
            "Sayt Google Maps kabi uchinchi tomon xizmatlariga havola qiladi va ularni o‘rnatadi. Biz ularning mazmuni yoki siyosati uchun javobgar emasmiz."
          ]
        },
        {
          heading: "Javobgarlik cheklovi",
          body: [
            "Sayt “qanday bo‘lsa, shundayligicha” taqdim etiladi. Qonun ruxsat bergan darajada Solief mehmonxonasi saytdan foydalanishdan kelib chiqadigan bilvosita zararlar uchun javobgar emas."
          ]
        },
        {
          heading: "Amaldagi qonun va aloqa",
          body: [
            `Ushbu shartlar O‘zbekiston Respublikasi qonunlari bilan tartibga solinadi. Savollar: ${contact.email}, ${contact.phone}.`
          ]
        }
      ]
    }
  }
};
