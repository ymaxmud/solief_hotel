import { z } from "zod";

export const roleSchema = z.enum(["admin", "manager", "receptionist"]);

export const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  role: roleSchema,
  password: z.string().min(12).regex(/[A-Za-z]/).regex(/[0-9]/)
});

export const userUpdateSchema = z.object({
  id: z.string().uuid(),
  role: roleSchema.optional(),
  isActive: z.boolean().optional(),
  forcePasswordChange: z.boolean().optional(),
  resetPassword: z.boolean().optional()
});

export const changePasswordSchema = z.object({
  password: z.string().min(12).regex(/[A-Za-z]/).regex(/[0-9]/)
});

// Staff members are hotel employees (attendance/services), not CRM logins — their
// job role is manager/receptionist only; 'admin' is a CRM-login role and must not
// be assignable here (the UI never offers it).
const staffRoleSchema = z.enum(["manager", "receptionist"]);

export const staffSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: staffRoleSchema.default("receptionist"),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().optional()
});

export const staffUpdateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: staffRoleSchema.optional(),
  status: z.enum(["active", "inactive"]).optional(),
  notes: z.string().optional(),
  attendancePin: z.string().min(6).optional()
});

export const attendanceTokenSchema = z.object({
  purpose: z.enum(["check_in", "check_out"])
});

export const qrAttendanceSchema = z.object({
  token: z.string().min(20),
  // Must be an email or contain at least one digit. Without this, an identifier
  // with no digits (e.g. "abc") normalizes to "" and matches any staff row whose
  // phone is null in redeem_attendance_qr, bypassing identity binding.
  staffIdentifier: z
    .string()
    .min(3)
    .refine((value) => value.includes("@") || /\d/.test(value), {
      message: "Enter a valid staff email or phone number."
    }),
  pin: z.string().min(4),
  purpose: z.enum(["check_in", "check_out"]),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  accuracy: z.coerce.number().optional()
});

export const manualAttendanceSchema = z.object({
  staffMemberId: z.string().uuid(),
  action: z.enum(["check_in", "check_out"]),
  correctionReason: z.string().min(5),
  at: z.string().optional()
});

export const createGuestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  preferredLanguage: z.enum(["EN", "RU", "UZ"]).optional().or(z.literal("")),
  preferredContact: z.string().trim().max(40).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal(""))
});

export const bookingUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "confirmed", "rejected", "cancelled", "no_show"]).optional(),
  assignedStaffId: z.string().uuid().nullable().optional(),
  internalNote: z.string().optional()
});

export const serviceAssignmentSchema = z.object({
  guestId: z.string().uuid(),
  staffMemberId: z.string().uuid(),
  stayId: z.string().uuid().optional().nullable(),
  bookingRequestId: z.string().uuid().optional().nullable(),
  serviceType: z.enum(["reception", "cleaning", "luggage", "airport_transfer", "maintenance", "complaint", "room_service", "other"]),
  status: z.enum(["open", "in_progress", "done", "cancelled"]).default("open"),
  notes: z.string().optional()
});

export const serviceUpdateSchema = z.object({
  id: z.string().uuid(),
  staffMemberId: z.string().uuid().optional(),
  status: z.enum(["open", "in_progress", "done", "cancelled"]).optional(),
  notes: z.string().optional()
});

export const staySchema = z.object({
  guestId: z.string().uuid(),
  bookingRequestId: z.string().uuid().optional().nullable(),
  roomId: z.string().uuid().optional().nullable(),
  status: z.enum(["lead", "expected", "checked_in", "checked_out", "cancelled"]).default("expected"),
  expectedCheckIn: z.string().optional(),
  expectedCheckOut: z.string().optional(),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  notes: z.string().optional()
});

export const stayUpdateSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid().nullable().optional(),
  status: z.enum(["lead", "expected", "checked_in", "checked_out", "cancelled"]).optional(),
  expectedCheckIn: z.string().optional(),
  expectedCheckOut: z.string().optional(),
  notes: z.string().optional()
});

export const roomUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["available", "occupied", "cleaning", "maintenance", "out_of_service"]).optional(),
  cleaningStatus: z.enum(["clean", "dirty", "in_progress", "inspected"]).optional(),
  notes: z.string().optional()
});

// --- Public website settings -----------------------------------------------
// These drive what visitors see on the public site, so every field is validated
// here as well as by a database constraint. A URL must be http(s): the public
// renderer rejects anything else, and catching it at entry gives the admin a
// clear error instead of a silently ignored value.

const optionalHttpUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Enter a full http(s) link, or leave the field empty." }
  )
  .optional()
  .or(z.literal(""));

const timeOfDay = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a 24-hour time such as 14:00");

export const websiteSettingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().min(5).max(40).optional(),
  email: z.string().trim().email("Enter a valid email address").max(160).optional().or(z.literal("")),
  address: z.string().trim().min(5).max(300).optional(),
  whatsappUrl: optionalHttpUrl,
  telegramUrl: optionalHttpUrl,
  googleMapsUrl: optionalHttpUrl,
  googleReviewsUrl: optionalHttpUrl,
  checkInTime: timeOfDay.optional(),
  checkOutTime: timeOfDay.optional(),
  // A rating outside 0–5 or a negative review count would be published straight
  // into the page's structured data, so both are bounded here.
  googleRating: z.coerce.number().min(0, "Rating cannot be negative").max(5, "Rating cannot be above 5").optional(),
  googleReviewCount: z.coerce.number().int().min(0, "Review count cannot be negative").max(1_000_000).optional(),
  // Rates are "UZS per 1 unit". Zero or negative would make the public price a
  // divide-by-zero or a negative number.
  usdRateUzs: z.coerce.number().positive("Rate must be greater than zero").max(10_000_000).optional(),
  eurRateUzs: z.coerce.number().positive("Rate must be greater than zero").max(10_000_000).optional()
});

export const roomCategoryUpdateSchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().trim().min(2).max(120).optional(),
  nameRu: z.string().trim().min(2).max(120).optional(),
  nameUz: z.string().trim().min(2).max(120).optional(),
  descriptionEn: z.string().trim().max(2000).optional().or(z.literal("")),
  descriptionRu: z.string().trim().max(2000).optional().or(z.literal("")),
  descriptionUz: z.string().trim().max(2000).optional().or(z.literal("")),
  basePriceUzs: z.coerce.number().nonnegative("Price cannot be negative").max(1_000_000_000).optional(),
  capacity: z.coerce.number().int().min(1).max(30).optional(),
  isActive: z.coerce.boolean().optional()
});

export const amenityToggleSchema = z.object({
  amenityKey: z.string().trim().min(1).max(64),
  isActive: z.coerce.boolean()
});
