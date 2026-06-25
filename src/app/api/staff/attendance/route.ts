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

export async function POST(request: Request) {
  const parsed = qrAttendanceSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const service = createSupabaseServiceClient();
  const tokenHash = hashAttendanceToken(input.token);
  const geo = isWithinAttendanceRadius({ lat: input.lat, lng: input.lng });
  const anomalyFlags = buildAnomalyFlags(input.accuracy, geo);

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
      p_ip: getClientIp(request),
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
