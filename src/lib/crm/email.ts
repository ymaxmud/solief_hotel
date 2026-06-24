import { Resend } from "resend";
import type { BookingFormValues } from "@/lib/schema";

export function getBookingRecipients() {
  const recipients = [
    process.env.BOOKING_EMAIL_TO,
    process.env.BOOKING_EMAIL_CC,
    process.env.HOTEL_OWNER_EMAIL
  ]
    .flatMap((value) => (value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  return Array.from(new Set(recipients));
}

export function buildBookingNotification(reference: string, data: BookingFormValues) {
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://soliefhotel.vercel.app"}/admin/booking-requests`;
  const subject = `New Solief Hotel booking request: ${data.name} ${data.checkIn} to ${data.checkOut}`;
  const body = [
    `Booking reference: ${reference}`,
    "",
    `Guest name: ${data.name}`,
    `Phone: ${data.phone || "Not provided"}`,
    `Email: ${data.email || "Not provided"}`,
    `Check-in: ${data.checkIn}`,
    `Check-out: ${data.checkOut}`,
    `Guests count: ${data.guests}`,
    `Room type: ${data.roomType}`,
    `Preferred contact: ${data.contactMethod}`,
    `Preferred language: ${data.language}`,
    "",
    "Message:",
    data.message || "No message",
    "",
    `Admin dashboard: ${adminUrl}`
  ].join("\n");
  return { subject, body, adminUrl };
}

export async function sendBookingEmail(reference: string, data: BookingFormValues) {
  const recipients = getBookingRecipients();
  const notification = buildBookingNotification(reference, data);
  const apiKey = process.env.RESEND_API_KEY;

  if (!recipients.length || !apiKey) {
    return {
      status: "manual_required" as const,
      recipients,
      notification,
      providerResponse: null,
      error: !apiKey ? "RESEND_API_KEY is not configured" : "No booking email recipients configured"
    };
  }

  const resend = new Resend(apiKey);
  const response = await resend.emails.send({
    from: "Solief Hotel <onboarding@resend.dev>",
    to: recipients,
    subject: notification.subject,
    text: notification.body
  });

  if (response.error) {
    return {
      status: "failed" as const,
      recipients,
      notification,
      providerResponse: response,
      error: response.error.message
    };
  }

  return {
    status: "sent" as const,
    recipients,
    notification,
    providerResponse: response,
    error: null
  };
}
