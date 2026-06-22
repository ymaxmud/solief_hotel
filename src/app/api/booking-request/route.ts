import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/schema";
import { buildBookingEmail, defaultRecipient } from "@/lib/email";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bookingSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const email = buildBookingEmail(parsed.data);
  const provider = process.env.EMAIL_PROVIDER;

  if (!provider) {
    return NextResponse.json({
      ok: true,
      mode: "mailto",
      recipient: defaultRecipient,
      mailto: email.mailto
    });
  }

  // Placeholder for future provider integration. Do not expose API keys here.
  return NextResponse.json({
    ok: true,
    mode: "prepared",
    recipient: defaultRecipient,
    subject: email.subject
  });
}
