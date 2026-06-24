import { NextResponse } from "next/server";
import { withRole } from "@/lib/crm/api";

const exportMap: Record<string, string> = {
  attendance: "attendance_records",
  bookings: "booking_requests",
  services: "service_assignments",
  guests: "guests",
  stays: "stays"
};

export async function GET(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return withRole(request, ["admin", "manager"], async ({ service }) => {
    const table = exportMap[type];
    if (!table) return NextResponse.json({ ok: false, error: "Unknown export type" }, { status: 404 });
    const { data, error } = await service.from(table).select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    const csv = toCsv(data || []);
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${type}.csv"`
      }
    });
  });
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvCell(row[header])).join(","));
  }
  return lines.join("\n");
}

function csvCell(value: unknown) {
  const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
