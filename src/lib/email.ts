import type { BookingFormValues } from "@/lib/schema";

export const defaultRecipient = process.env.BOOKING_EMAIL_TO || "hsolief@gmail.com";

export function buildBookingEmail(data: BookingFormValues) {
  const subject = `Solief Hotel booking request — ${data.name}`;
  const body = [
    "Solief Hotel booking request",
    "",
    `Guest name: ${data.name}`,
    `Phone: ${data.phone || "Not provided"}`,
    `Email: ${data.email || "Not provided"}`,
    `Check-in: ${data.checkIn}`,
    `Check-out: ${data.checkOut}`,
    `Guests: ${data.guests}`,
    `Room type: ${data.roomType}`,
    `Preferred language: ${data.language}`,
    `Preferred contact method: ${data.contactMethod}`,
    "",
    "Message:",
    data.message || "No message"
  ].join("\n");

  return {
    subject,
    body,
    mailto: `mailto:${defaultRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  };
}
