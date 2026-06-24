import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { attendanceTokenSchema } from "@/lib/crm/validation";
import { createAttendanceToken, hashAttendanceToken } from "@/lib/crm/attendance";
import { withRole, insertAudit } from "@/lib/crm/api";

export async function POST(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const parsed = attendanceTokenSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    const token = createAttendanceToken();
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const { data, error } = await service
      .from("attendance_qr_tokens")
      .insert({
        token_hash: hashAttendanceToken(token),
        purpose: parsed.data.purpose,
        expires_at: expiresAt,
        created_by: profile.id
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://soliefhotel.vercel.app"}/staff/attendance?token=${encodeURIComponent(token)}&purpose=${parsed.data.purpose}`;
    const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320 });
    await insertAudit(request, profile.id, "create", "attendance_qr_tokens", data.id, { purpose: parsed.data.purpose, expiresAt });
    return NextResponse.json({ ok: true, tokenId: data.id, url, qrDataUrl, expiresAt });
  });
}
