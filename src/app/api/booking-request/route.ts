import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/schema";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { createBookingReference } from "@/lib/crm/reference";
import { sendBookingEmail } from "@/lib/crm/email";
import { buildWhatsAppBookingLink } from "@/lib/crm/whatsapp";

type RateLimitResult = {
  ok: boolean;
  attempts: number;
  retry_after_seconds: number;
};

type BookingRequestResult = {
  booking_request_id: string;
  guest_id: string;
  public_reference: string;
};

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bookingSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const reference = createBookingReference();
  const booking = parsed.data;
  const ip = getClientIp(request);
  const fingerprint = [
    ip,
    request.headers.get("user-agent") || "",
    normalizeForLimit(booking.email),
    normalizeForLimit(booking.phone)
  ].join("|");

  const { data: rateLimitData, error: rateLimitError } = await service
    .rpc("check_public_rate_limit", {
      p_scope: "booking_request",
      p_identifier: fingerprint,
      p_max_attempts: 5,
      p_window_seconds: 60
    })
    .single();

  if (rateLimitError) {
    return NextResponse.json({ ok: false, error: "Could not validate request rate limit." }, { status: 500 });
  }

  const rateLimit = rateLimitData as RateLimitResult | null;
  if (rateLimit && !rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many booking requests. Please try again soon.", retryAfterSeconds: rateLimit.retry_after_seconds },
      { status: 429 }
    );
  }

  const { data: bookingRequest, error: bookingError } = await service
    .rpc("create_public_booking_request", {
      p_reference: reference,
      p_full_name: booking.name,
      p_phone: booking.phone || null,
      p_email: booking.email || null,
      p_guests_count: booking.guests,
      p_check_in: booking.checkIn,
      p_check_out: booking.checkOut,
      p_room_type: booking.roomType,
      p_preferred_contact: booking.contactMethod,
      p_preferred_language: booking.language,
      p_message: booking.message || null,
      p_source: "website"
    })
    .single();

  if (bookingError) {
    return NextResponse.json({ ok: false, error: "Could not save booking request." }, { status: 500 });
  }
  const createdBooking = bookingRequest as BookingRequestResult;

  const emailResult = await sendBookingEmail(reference, booking);
  await service.from("notifications").insert(
    emailResult.recipients.length
      ? emailResult.recipients.map((recipient) => ({
          channel: "email",
          status: emailResult.status,
          booking_request_id: createdBooking.booking_request_id,
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
            booking_request_id: createdBooking.booking_request_id,
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
    bookingRequestId: createdBooking.booking_request_id,
    emailStatus: emailResult.status,
    whatsappLink: buildWhatsAppBookingLink(reference, booking)
  });
}

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function normalizeForLimit(value?: string) {
  return (value || "").trim().toLowerCase();
}
