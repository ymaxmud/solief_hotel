import { Resend } from "resend";
import nodemailer from "nodemailer";
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

// SMTP is considered configured once a user + password are present. Host/port
// default to Gmail so a Gmail App Password needs only SMTP_USER + SMTP_PASS.
function smtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendViaSmtp(recipients: string[], subject: string, text: string, from: string) {
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Don't let a slow SMTP handshake hang the serverless function.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000
  });
  const info = await transporter.sendMail({ from, to: recipients.join(", "), subject, text });
  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response };
}

export async function sendBookingEmail(reference: string, data: BookingFormValues) {
  const recipients = getBookingRecipients();
  const notification = buildBookingNotification(reference, data);

  if (!recipients.length) {
    return {
      status: "manual_required" as const,
      recipients,
      notification,
      providerResponse: null,
      error: "No booking email recipients configured (set BOOKING_EMAIL_TO)"
    };
  }

  // Preferred path: direct SMTP (e.g. Gmail App Password) — no third-party API.
  if (smtpConfigured()) {
    const from = process.env.BOOKING_EMAIL_FROM || process.env.SMTP_USER!;
    try {
      const providerResponse = await sendViaSmtp(recipients, notification.subject, notification.body, from);
      return { status: "sent" as const, recipients, notification, providerResponse, error: null };
    } catch (error) {
      return {
        status: "failed" as const,
        recipients,
        notification,
        providerResponse: null,
        error: error instanceof Error ? error.message : "SMTP send failed"
      };
    }
  }

  // Fallback path: Resend API (if configured instead of SMTP).
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_EMAIL_FROM;
  if (!apiKey || !from) {
    return {
      status: "manual_required" as const,
      recipients,
      notification,
      providerResponse: null,
      error: !apiKey
        ? "No email transport configured (set SMTP_USER + SMTP_PASS, or RESEND_API_KEY)"
        : "BOOKING_EMAIL_FROM verified sender is not configured"
    };
  }

  const resend = new Resend(apiKey);
  const response = await resend.emails.send({
    from,
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
