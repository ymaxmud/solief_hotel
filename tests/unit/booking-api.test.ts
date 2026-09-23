import { beforeEach, describe, expect, it, vi } from "vitest";

const inserts: Array<{ table: string; payload: unknown }> = [];
const rpcCalls: Array<{ name: string; payload: Record<string, unknown> }> = [];

/** A date far enough ahead that the past-date guard never trips as time passes. */
function futureDate(daysAhead: number) {
  const date = new Date(Date.now() + daysAhead * 86_400_000);
  return date.toISOString().slice(0, 10);
}

const CHECK_IN = futureDate(30);
const CHECK_OUT = futureDate(32);

let categoryResult: { data: unknown; error: { message: string } | null } = {
  data: [
    {
      id: "category-id",
      slug: "standard-double-twin",
      name_en: "Standard Double or Twin Room",
      base_price_uzs: 500000,
      capacity: 2,
      is_active: true
    }
  ],
  error: null
};

/** When true, the mock database only has the legacy 12-argument booking RPC. */
let snapshotRpcMissing = false;

let bookingRpcResult: { data: unknown; error: { code?: string; message: string } | null } = {
  data: { booking_request_id: "booking-id", guest_id: "guest-id", public_reference: "SOL-TEST" },
  error: null
};

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    rpc: (name: string, payload: Record<string, unknown>) => {
      rpcCalls.push({ name, payload });
      return {
        single: async () => {
          if (name === "check_public_rate_limit") {
            return { data: { ok: true, attempts: 1, retry_after_seconds: 0 }, error: null };
          }
          if (name === "create_public_booking_request") {
            // Simulate a database that only has the legacy 12-argument version:
            // the call carrying snapshot arguments is rejected the way PostgREST
            // rejects an unknown signature.
            const isSnapshotCall = "p_room_category_id" in payload;
            if (snapshotRpcMissing && isSnapshotCall) {
              return {
                data: null,
                error: {
                  code: "PGRST202",
                  message:
                    "Could not find the function public.create_public_booking_request(...) in the schema cache"
                }
              };
            }
            return bookingRpcResult;
          }
          return { data: null, error: new Error("unknown rpc") };
        }
      };
    },
    from: (table: string) => ({
      select: () => ({
        eq: async () => categoryResult
      }),
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
    error: "No email transport configured"
  })
}));

function bookingBody(overrides: Record<string, unknown> = {}) {
  return {
    name: "E2E Solief Test",
    phone: "+998901234567",
    email: "",
    checkIn: CHECK_IN,
    checkOut: CHECK_OUT,
    guests: 2,
    roomType: "Standard Double or Twin Room",
    roomId: "standard-double-twin",
    language: "EN",
    contactMethod: "Phone",
    message: "",
    ...overrides
  };
}

async function post(body: unknown) {
  const { POST } = await import("@/app/api/booking-request/route");
  const request = new Request("http://localhost/api/booking-request", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
  const response = await POST(request);
  return { response, json: await response.json() };
}

describe("booking request API", () => {
  beforeEach(() => {
    inserts.length = 0;
    rpcCalls.length = 0;
    snapshotRpcMissing = false;
    categoryResult = {
      data: [
        {
          id: "category-id",
          slug: "standard-double-twin",
          name_en: "Standard Double or Twin Room",
          base_price_uzs: 500000,
          capacity: 2,
          is_active: true
        }
      ],
      error: null
    };
    bookingRpcResult = {
      data: { booking_request_id: "booking-id", guest_id: "guest-id", public_reference: "SOL-TEST" },
      error: null
    };
  });

  it("saves the request and still succeeds when the notification fails", async () => {
    const { response, json } = await post(bookingBody());
    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.bookingRequestId).toBe("booking-id");
    expect(json.emailStatus).toBe("manual_required");
    expect(rpcCalls.filter((item) => item.name === "check_public_rate_limit")).toHaveLength(4);
    expect(inserts.some((item) => item.table === "notifications")).toBe(true);
  });

  it("calculates the price snapshot server-side from the configured category", async () => {
    await post(bookingBody());
    const call = rpcCalls.find((item) => item.name === "create_public_booking_request");
    expect(call?.payload.p_room_category_id).toBe("category-id");
    expect(call?.payload.p_nightly_price_uzs).toBe(500000);
    expect(call?.payload.p_nights).toBe(2);
    expect(call?.payload.p_estimated_total_uzs).toBe(1_000_000);
  });

  it("ignores a price supplied by the browser", async () => {
    await post(bookingBody({ nightlyPriceUzs: 1, estimatedTotalUzs: 1 }));
    const call = rpcCalls.find((item) => item.name === "create_public_booking_request");
    expect(call?.payload.p_nightly_price_uzs).toBe(500000);
    expect(call?.payload.p_estimated_total_uzs).toBe(1_000_000);
  });

  it("rejects a room id that is not an active category", async () => {
    const { response, json } = await post(bookingBody({ roomId: "penthouse-suite" }));
    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(rpcCalls.some((item) => item.name === "create_public_booking_request")).toBe(false);
  });

  it("rejects more guests than the category capacity", async () => {
    const { response, json } = await post(bookingBody({ guests: 6 }));
    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(rpcCalls.some((item) => item.name === "create_public_booking_request")).toBe(false);
  });

  it("rejects a check-in date in the past", async () => {
    const { response } = await post(bookingBody({ checkIn: "2020-01-01", checkOut: "2020-01-03" }));
    expect(response.status).toBe(400);
  });

  it("rejects check-out on or before check-in", async () => {
    const { response } = await post(bookingBody({ checkOut: CHECK_IN }));
    expect(response.status).toBe(400);
  });

  it("rejects a malformed JSON body without throwing", async () => {
    const { response, json } = await post("{not json");
    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("does not report success when persistence fails", async () => {
    bookingRpcResult = { data: null, error: { message: "insert failed" } };
    const { response, json } = await post(bookingBody());
    expect(response.status).toBe(500);
    expect(json.ok).toBe(false);
    expect(json.reference).toBeUndefined();
  });

  describe("database without the price-snapshot migration", () => {
    it("falls back to the legacy signature so the booking is still persisted", async () => {
      snapshotRpcMissing = true;
      const { response, json } = await post(bookingBody());

      expect(response.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.reference).toMatch(/^SOL-/);

      const bookingCalls = rpcCalls.filter((item) => item.name === "create_public_booking_request");
      expect(bookingCalls).toHaveLength(2);
      // First the current signature, then the legacy retry.
      expect("p_room_category_id" in bookingCalls[0].payload).toBe(true);
      expect("p_room_category_id" in bookingCalls[1].payload).toBe(false);
    });

    it("still sends every booking field on the legacy retry", async () => {
      snapshotRpcMissing = true;
      await post(bookingBody());
      const legacy = rpcCalls.filter((item) => item.name === "create_public_booking_request")[1];
      for (const key of [
        "p_reference",
        "p_full_name",
        "p_phone",
        "p_guests_count",
        "p_check_in",
        "p_check_out",
        "p_room_type",
        "p_preferred_contact",
        "p_preferred_language",
        "p_source"
      ]) {
        expect(legacy.payload).toHaveProperty(key);
      }
      expect(Object.keys(legacy.payload)).toHaveLength(12);
    });

    it("still records a notification and returns a reference to the guest", async () => {
      snapshotRpcMissing = true;
      const { json } = await post(bookingBody());
      expect(inserts.some((item) => item.table === "notifications")).toBe(true);
      expect(json.bookingRequestId).toBe("booking-id");
    });

    it("does not retry on a genuine database error, and still fails closed", async () => {
      // A real failure must not be mistaken for a missing signature.
      bookingRpcResult = { data: null, error: { code: "23505", message: "duplicate key value" } };
      const { response, json } = await post(bookingBody());

      expect(response.status).toBe(500);
      expect(json.ok).toBe(false);
      expect(json.reference).toBeUndefined();
      expect(rpcCalls.filter((item) => item.name === "create_public_booking_request")).toHaveLength(1);
    });
  });
});
