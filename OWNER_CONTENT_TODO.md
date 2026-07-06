# Owner Content — items to confirm

These are content decisions only the hotel owner can make. Nothing here blocks the site
from running. Where a value is unknown it is **not invented** — it is left empty (and
hidden in the UI) or shown with a disclaimer.

## Confirmed real (no action needed)
- Phone: `+998 71 208 49 49`, Email: `info@soliefhotel.uz`
- Address: Naqqoshlik 12, Chilanzar district, Tashkent; map/profile links
- **Room types, prices, areas, beds, amenities** — now populated from the real data
  (`src/content/rooms.ts`): Standard Double/Twin 500 000 UZS, Twin Suite 650 000 UZS,
  Deluxe Triple 700 700 UZS, Deluxe Quadruple 1 000 000 UZS.
- Room photos: `public/rooms/**` (from `solief_room_photos`).

## Needs owner confirmation

1. **Google rating badge "4.2 / 5 · 75 reviews"** — hardcoded in `src/i18n/*.ts`
   (`hero.rating`, `hero.reviews`) and `src/content/siteContent.ts` (`rating`,
   `reviewCount`). Confirm the live Google numbers or remove the badge. It currently
   does not link to the source; consider linking to `contact.googleMapsProfileUrl`.

2. **WhatsApp / Telegram / Booking.com / Instagram / Facebook** — empty in
   `src/content/contact.ts` (`whatsappUrl`, `telegramUrl`, `bookingComUrl`,
   `instagramUrl`, `facebookUrl`). These channels are now **hidden** in the UI (no more
   "coming soon"). Fill them in to make the buttons appear.

3. **General amenities section** — `src/content/amenities.ts` marks 6 items
   `placeholder: true` (breakfast details, parking, airport transfer, kitchen, laundry,
   non-smoking) shown with "confirm with hotel" disclaimers. Confirm exact availability
   or remove. (Note: per-room amenities in `src/content/rooms.ts` are confirmed and are
   separate from this general section.)

4. **FAQ** — `src/content/faq.ts` has an airport-transfer answer explicitly marked as a
   placeholder to confirm.

5. **Payment methods** — cash "may be accepted depending on tariff"; cancellation and
   prepayment "vary by rate". If there is a single fixed policy, we can state it exactly.

## Known asset note
- `public/images/14.png` does not exist and is intentionally excluded
  (`src/content/images.ts` → `missingImageIds`). Not referenced anywhere, so no broken
  image. Supply it only if a full 1–35 set is required.
