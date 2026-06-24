import type { BookingFormValues } from "@/lib/schema";

export function buildWhatsAppBookingLink(reference: string, data: BookingFormValues) {
  const configured = process.env.HOTEL_OWNER_WHATSAPP_E164;
  if (!configured) return null;
  const phone = configured.replace(/[^\d]/g, "");
  if (!phone) return null;

  const summary = [
    `New Solief Hotel booking request: ${reference}`,
    `Guest: ${data.name}`,
    `Dates: ${data.checkIn} to ${data.checkOut}`,
    `Guests: ${data.guests}`,
    `Room: ${data.roomType}`,
    `Phone: ${data.phone || "not provided"}`,
    `Email: ${data.email || "not provided"}`
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(summary)}`;
}

// TODO: Future optional Meta WhatsApp Cloud API integration can read dedicated
// server-only env vars here. It is intentionally disabled in v1.
