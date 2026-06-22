import { z } from "zod";

export const bookingSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().optional(),
    email: z.string().email("Valid email required").optional().or(z.literal("")),
    checkIn: z.string().min(1, "Check-in required"),
    checkOut: z.string().min(1, "Check-out required"),
    guests: z.coerce.number().min(1, "At least one guest"),
    roomType: z.string().min(1, "Room type required"),
    language: z.string().min(1, "Preferred language required"),
    contactMethod: z.string().min(1, "Contact method required"),
    message: z.string().optional()
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: "Phone or email is required",
    path: ["phone"]
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"]
  });

export const quickBookingSchema = z
  .object({
    checkIn: z.string().min(1),
    checkOut: z.string().min(1),
    guests: z.coerce.number().min(1),
    roomType: z.string().min(1),
    contactMethod: z.string().min(1)
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"]
  });

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type QuickBookingValues = z.infer<typeof quickBookingSchema>;
