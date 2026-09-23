import { z } from "zod";
import { tashkentToday } from "@/lib/datetime";

/** YYYY-MM-DD, as emitted by an <input type="date">. */
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date")
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()), "Invalid date");

const SUPPORTED_LANGUAGES = ["EN", "RU", "UZ"] as const;
const SUPPORTED_CONTACT_METHODS = ["Phone", "Email", "WhatsApp", "Telegram"] as const;

/** The longest stay the request form accepts, as a sanity bound. */
export const MAX_NIGHTS = 60;

export const bookingSchema = z
  .object({
    name: z.string().min(2, "Name is required").max(120),
    phone: z.string().max(40).optional(),
    email: z.string().email("Valid email required").max(160).optional().or(z.literal("")),
    checkIn: dateOnly,
    checkOut: dateOnly,
    guests: z.coerce.number().int("Whole guests only").min(1, "At least one guest").max(30),
    // Display label only. The server never prices from this string — it resolves
    // the category from `roomId` against the active configured categories.
    roomType: z.string().min(1, "Room type required").max(120),
    /** Stable room-category slug, used server-side to look up the real price. */
    roomId: z.string().max(64).optional(),
    language: z.enum(SUPPORTED_LANGUAGES, { errorMap: () => ({ message: "Preferred language required" }) }),
    contactMethod: z.enum(SUPPORTED_CONTACT_METHODS, {
      errorMap: () => ({ message: "Contact method required" })
    }),
    message: z.string().max(2000).optional(),
    turnstileToken: z.string().max(4096).optional()
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: "Phone or email is required",
    path: ["phone"]
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"]
  })
  // Compare date strings rather than Date objects: both are YYYY-MM-DD in the
  // hotel's own timezone, so a lexical compare is the correct calendar compare
  // and avoids a UTC-vs-local off-by-one at the day boundary.
  .refine((data) => data.checkIn >= tashkentToday(), {
    message: "Check-in cannot be in the past",
    path: ["checkIn"]
  })
  .refine(
    (data) =>
      (new Date(`${data.checkOut}T00:00:00Z`).getTime() - new Date(`${data.checkIn}T00:00:00Z`).getTime()) /
        86_400_000 <=
      MAX_NIGHTS,
    { message: `Stays longer than ${MAX_NIGHTS} nights must be arranged with the hotel directly`, path: ["checkOut"] }
  );

export const quickBookingSchema = z
  .object({
    checkIn: dateOnly,
    checkOut: dateOnly,
    guests: z.coerce.number().int().min(1).max(30),
    roomType: z.string().min(1).max(120),
    roomId: z.string().max(64).optional(),
    contactMethod: z.enum(SUPPORTED_CONTACT_METHODS)
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"]
  })
  .refine((data) => data.checkIn >= tashkentToday(), {
    message: "Check-in cannot be in the past",
    path: ["checkIn"]
  });

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type QuickBookingValues = z.infer<typeof quickBookingSchema>;
