import { NextResponse } from "next/server";
import { qrAttendanceSchema } from "@/lib/crm/validation";
import { hashAttendanceToken, isWithinAttendanceRadius } from "@/lib/crm/attendance";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type AttendanceRedeemResult = {
  ok: boolean;
  error_code: string | null;
  attendance_record_id: string | null;
  status: string | null;
};

type RateLimitResult = {
  ok: boolean;
  attempts: number;
  retry_after_seconds: number;
};

export async function POST(request: Request) {
  const parsed = qrAttendanceSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const service = createSupabaseServiceClient();
  const tokenHash = hashAttendanceToken(input.token);
  const geo = isWithinAttendanceRadius({ lat: input.lat, lng: input.lng });
  const anomalyFlags = buildAnomalyFlags(input.accuracy, geo);
  const ip = getClientIp(request) || "unknown";
  const rateLimit = await checkAttendanceRateLimits(service, [
    { scope: "attendance_ip", identifier: ip, maxAttempts: 20, windowSeconds: 300 },
    { scope: "attendance_staff_identifier", identifier: normalizeIdentifier(input.staffIdentifier), maxAttempts: 8, windowSeconds: 300 },
    { scope: "attendance_token", identifier: tokenHash, maxAttempts: 6, windowSeconds: 60 }
  ]);

  if (rateLimit.error) return NextResponse.json({ ok: false, error: "Could not validate attendance rate limit." }, { status: 500 });
  if (rateLimit.limited) {
    return NextResponse.json(
      { ok: false, error: "Too many attendance attempts. Please wait and try again.", retryAfterSeconds: rateLimit.retryAfterSeconds },
      { status: 429 }
    );
  }

  const { data, error } = await service
    .rpc("redeem_attendance_qr", {
      p_token_hash: tokenHash,
      p_purpose: input.purpose,
      p_staff_identifier: input.staffIdentifier,
      p_pin: input.pin,
      p_lat: input.lat,
      p_lng: input.lng,
      p_accuracy_meters: input.accuracy ?? null,
      p_distance_meters: geo.distance,
      p_radius_meters: geo.radius,
      p_ip: ip,
      p_user_agent: request.headers.get("user-agent") || null,
      p_anomaly_flags: anomalyFlags
    })
    .single();

  if (error) return NextResponse.json({ ok: false, error: "Attendance verification failed." }, { status: 500 });
  const result = data as AttendanceRedeemResult;
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: attendanceErrorMessage(result.error_code), code: result.error_code }, { status: 400 });
  }

  return NextResponse.json({ ok: true, attendanceRecordId: result.attendance_record_id, status: result.status, anomalyFlags });
}

async function checkAttendanceRateLimits(
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

function buildAnomalyFlags(accuracy: number | undefined, geo: { ok: boolean; distance: number; radius: number }) {
  const flags: string[] = [];
  if (accuracy == null) flags.push("missing_accuracy");
  if (accuracy != null && accuracy > 100) flags.push("low_accuracy");
  if (!geo.ok) flags.push("outside_radius");
  return flags;
}

function attendanceErrorMessage(code: string | null) {
  const messages: Record<string, string> = {
    invalid_staff_pin: "Staff identifier or PIN is incorrect.",
    missing_location: "Location is required for QR attendance.",
    outside_radius: "Attendance location is outside the allowed hotel radius.",
    duplicate_open_attendance: "This staff member already has an open attendance record.",
    no_open_attendance: "No open attendance record found for this staff member.",
    token_used: "This QR token has already been used.",
    token_expired: "This QR token has expired.",
    invalid_token: "Invalid QR token."
  };
  return messages[code || ""] || "Attendance failed.";
}

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
}

function normalizeIdentifier(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed.includes("@") ? trimmed : trimmed.replace(/\D/g, "") || trimmed;
}
