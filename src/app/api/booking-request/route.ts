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

  const booking = parsed.data;
  const ip = getClientIp(request);
  const turnstile = await verifyTurnstile(booking.turnstileToken, ip);
  if (!turnstile.ok) {
    return NextResponse.json({ ok: false, error: "Could not verify anti-spam challenge." }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const reference = createBookingReference();
  const userAgent = request.headers.get("user-agent") || "";
  const rateLimit = await checkBookingRateLimits(service, [
    { scope: "booking_ip", identifier: `${ip}|${userAgent}`, maxAttempts: 5, windowSeconds: 60 },
    { scope: "booking_ip_hour", identifier: ip, maxAttempts: 20, windowSeconds: 3600 },
    { scope: "booking_contact", identifier: normalizeContact(booking.email, booking.phone), maxAttempts: 3, windowSeconds: 3600 },
    { scope: "booking_trip", identifier: `${normalizeForLimit(booking.name)}|${booking.checkIn}|${booking.checkOut}|${booking.roomType}`, maxAttempts: 3, windowSeconds: 3600 }
  ]);

  if (rateLimit.error) {
    return NextResponse.json({ ok: false, error: "Could not validate request rate limit." }, { status: 500 });
  }
  if (rateLimit.limited) {
    return NextResponse.json(
      { ok: false, error: "Too many booking requests. Please try again soon.", retryAfterSeconds: rateLimit.retryAfterSeconds },
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
  const { error: notificationError } = await service.from("notifications").insert(
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
  if (notificationError) {
    console.error("Failed to record booking notification", {
      bookingRequestId: createdBooking.booking_request_id,
      error: notificationError.message
    });
  }

  return NextResponse.json({
    ok: true,
    reference,
    bookingRequestId: createdBooking.booking_request_id,
    emailStatus: emailResult.status,
    notificationLogStatus: notificationError ? "failed" : "recorded",
    whatsappLink: buildWhatsAppBookingLink(reference, booking)
  });
}

async function checkBookingRateLimits(
  service: ReturnType<typeof createSupabaseServiceClient>,
  checks: Array<{ scope: string; identifier: string; maxAttempts: number; windowSeconds: number }>
) {
  let retryAfterSeconds = 0;
  for (const check of checks) {
    const { data, error } = await service
      .rpc("check_public_rate_limit", {
        p_scope: check.scope,
        p_identifier: check.identifier,
        p_max_attempts: check.maxAttempts,
        p_window_seconds: check.windowSeconds
      })
      .single();
    if (error) return { error: true, limited: false, retryAfterSeconds: 0 };
    const result = data as RateLimitResult | null;
    if (result && !result.ok) {
      retryAfterSeconds = Math.max(retryAfterSeconds, result.retry_after_seconds || 0);
    }
  }
  return { error: false, limited: retryAfterSeconds > 0, retryAfterSeconds };
}

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function normalizeForLimit(value?: string) {
  return (value || "").trim().toLowerCase();
}

function normalizeContact(email?: string, phone?: string) {
  const normalizedEmail = normalizeForLimit(email);
  const normalizedPhone = (phone || "").replace(/\D/g, "");
  return normalizedEmail || normalizedPhone || "missing-contact";
}

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };
  if (!token) return { ok: false };

  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  if (ip && ip !== "unknown") form.set("remoteip", ip);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form
    });
    const json = (await response.json()) as { success?: boolean };
    return { ok: response.ok && Boolean(json.success) };
  } catch {
    return { ok: false };
  }
}
