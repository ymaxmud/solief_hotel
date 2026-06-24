import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/schema";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { createBookingReference } from "@/lib/crm/reference";
import { sendBookingEmail } from "@/lib/crm/email";
import { buildWhatsAppBookingLink } from "@/lib/crm/whatsapp";

const recentSubmissions = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, error: "Too many booking requests. Please try again soon." }, { status: 429 });
  }

  const json = await request.json();
  const parsed = bookingSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const reference = createBookingReference();
  const booking = parsed.data;

  const { data: guest, error: guestError } = await service
    .from("guests")
    .insert({
      full_name: booking.name,
      phone: booking.phone || null,
      email: booking.email || null,
      preferred_language: booking.language,
      preferred_contact: booking.contactMethod,
      notes: booking.message || null
    })
    .select("id")
    .single();

  if (guestError) {
    return NextResponse.json({ ok: false, error: "Could not save guest lead." }, { status: 500 });
  }

  const { data: bookingRequest, error: bookingError } = await service
    .from("booking_requests")
    .insert({
      public_reference: reference,
      guest_id: guest.id,
      full_name: booking.name,
      phone: booking.phone || null,
      email: booking.email || null,
      guests_count: booking.guests,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      room_type: booking.roomType,
      preferred_contact: booking.contactMethod,
      preferred_language: booking.language,
      message: booking.message || null,
      source: "website"
    })
    .select("id, public_reference")
    .single();

  if (bookingError) {
    return NextResponse.json({ ok: false, error: "Could not save booking request." }, { status: 500 });
  }

  const emailResult = await sendBookingEmail(reference, booking);
  await service.from("notifications").insert(
    emailResult.recipients.length
      ? emailResult.recipients.map((recipient) => ({
          channel: "email",
          status: emailResult.status,
          booking_request_id: bookingRequest.id,
          recipient,
          subject: emailResult.notification.subject,
          body: emailResult.notification.body,
          provider_response: emailResult.providerResponse,
          error: emailResult.error,
          sent_at: emailResult.status === "sent" ? new Date().toISOString() : null
        }))
      : [
          {
            channel: "email",
            status: emailResult.status,
            booking_request_id: bookingRequest.id,
            recipient: process.env.BOOKING_EMAIL_TO || "not-configured",
            subject: emailResult.notification.subject,
            body: emailResult.notification.body,
            provider_response: emailResult.providerResponse,
            error: emailResult.error,
            sent_at: null
          }
        ]
  );

  return NextResponse.json({
    ok: true,
    reference,
    bookingRequestId: bookingRequest.id,
    emailStatus: emailResult.status,
    whatsappLink: buildWhatsAppBookingLink(reference, booking)
  });
}

function checkRateLimit(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  for (const [key, timestamp] of recentSubmissions) {
    if (timestamp < windowStart) recentSubmissions.delete(key);
  }
  const count = Array.from(recentSubmissions.entries()).filter(([key]) => key.startsWith(`${ip}:`)).length;
  if (count >= RATE_LIMIT_MAX) return { ok: false };
  recentSubmissions.set(`${ip}:${now}:${Math.random()}`, now);
  return { ok: true };
}
