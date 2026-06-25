import { beforeEach, describe, expect, it, vi } from "vitest";

const inserts: Array<{ table: string; payload: unknown }> = [];
const rpcCalls: Array<{ name: string; payload: unknown }> = [];

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    rpc: (name: string, payload: unknown) => {
      rpcCalls.push({ name, payload });
      return {
        single: async () => {
          if (name === "check_public_rate_limit") return { data: { ok: true, attempts: 1, retry_after_seconds: 0 }, error: null };
          if (name === "create_public_booking_request") return { data: { booking_request_id: "booking-id", guest_id: "guest-id", public_reference: "SOL-TEST" }, error: null };
          return { data: null, error: new Error("unknown rpc") };
        }
      };
    },
    from: (table: string) => ({
      insert: (payload: unknown) => {
        inserts.push({ table, payload });
        return {
          select: () => ({
            single: async () => ({ data: { id: `${table}-id`, public_reference: "SOL-TEST" }, error: null })
          }),
          then: async (resolve: (value: unknown) => unknown) => resolve({ data: null, error: null })
        };
      }
    })
  })
}));

vi.mock("@/lib/crm/email", () => ({
  sendBookingEmail: async () => ({
    status: "manual_required",
    recipients: ["owner@example.com"],
    notification: { subject: "subject", body: "body" },
    providerResponse: null,
    error: "RESEND_API_KEY is not configured"
  })
}));

describe("booking request API", () => {
  beforeEach(() => {
    inserts.length = 0;
    rpcCalls.length = 0;
  });

  it("saves request and still succeeds if email fails", async () => {
    const { POST } = await import("@/app/api/booking-request/route");
    const request = new Request("http://localhost/api/booking-request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Demo Guest",
        phone: "+998901234567",
        email: "",
        checkIn: "2026-07-01",
        checkOut: "2026-07-03",
        guests: 2,
        roomType: "Standard Double Room",
        language: "EN",
        contactMethod: "Phone",
        message: ""
      })
    });
    const response = await POST(request);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(rpcCalls.some((item) => item.name === "check_public_rate_limit")).toBe(true);
    expect(rpcCalls.some((item) => item.name === "create_public_booking_request")).toBe(true);
    expect(inserts.some((item) => item.table === "notifications")).toBe(true);
    expect(json.bookingRequestId).toBe("booking-id");
  });
});
