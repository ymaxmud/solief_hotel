import { z } from "zod";

export const roleSchema = z.enum(["admin", "manager", "receptionist"]);

export const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  role: roleSchema,
  password: z.string().min(8)
});

export const staffSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: roleSchema.default("receptionist"),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().optional()
});

export const attendanceTokenSchema = z.object({
  purpose: z.enum(["check_in", "check_out"])
});

export const qrAttendanceSchema = z.object({
  token: z.string().min(20),
  staffMemberId: z.string().uuid(),
  purpose: z.enum(["check_in", "check_out"]),
  lat: z.coerce.number(),
  lng: z.coerce.number()
});

export const manualAttendanceSchema = z.object({
  staffMemberId: z.string().uuid(),
  action: z.enum(["check_in", "check_out"]),
  correctionReason: z.string().min(5),
  at: z.string().optional()
});

export const bookingUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "confirmed", "rejected", "cancelled", "no_show"]).optional(),
  assignedStaffId: z.string().uuid().nullable().optional()
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
