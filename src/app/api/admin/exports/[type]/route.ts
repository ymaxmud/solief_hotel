import { NextResponse } from "next/server";
import { withRole, insertAudit } from "@/lib/crm/api";
import { assertCan, type CrmAction } from "@/lib/crm/permissions";
import { toCsv } from "@/lib/crm/csv";

const exportMap: Record<string, { table: string; action: CrmAction; maxRows: number }> = {
  attendance: { table: "attendance_records", action: "export:attendance", maxRows: 5000 },
  bookings: { table: "booking_requests", action: "export:bookings", maxRows: 5000 },
  services: { table: "service_assignments", action: "export:services", maxRows: 5000 },
  guests: { table: "guests", action: "export:guests", maxRows: 2000 },
  stays: { table: "stays", action: "export:stays", maxRows: 5000 }
};

export async function GET(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const config = exportMap[type];
    if (!config) return NextResponse.json({ ok: false, error: "Unknown export type" }, { status: 404 });
    const allowed = assertCan(profile.role, config.action);
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });

    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const status = url.searchParams.get("status");
    let query = service.from(config.table).select("*").order("created_at", { ascending: false }).limit(config.maxRows);
    if (from) query = query.gte("created_at", `${from}T00:00:00.000Z`);
    if (to) query = query.lte("created_at", `${to}T23:59:59.999Z`);
    if (status && ["bookings", "services", "stays", "attendance"].includes(type)) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await insertAudit(request, profile.id, "export", config.table, null, { type, from, to, status, rows: data?.length || 0 });
    const csv = toCsv(data || []);
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${type}.csv"`
      }
    });
  });
}
