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

export const staffSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: roleSchema.default("receptionist"),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().optional()
});

export const staffUpdateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: roleSchema.optional(),
  status: z.enum(["active", "inactive"]).optional(),
  notes: z.string().optional(),
  attendancePin: z.string().min(6).optional()
});

export const attendanceTokenSchema = z.object({
  purpose: z.enum(["check_in", "check_out"])
});

export const qrAttendanceSchema = z.object({
  token: z.string().min(20),
  staffIdentifier: z.string().min(3),
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
