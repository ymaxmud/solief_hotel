import { z } from "zod";

export const bookingSchema = z
  .object({
    name: z.string().min(2, "Name is required").max(120),
    phone: z.string().max(40).optional(),
    email: z.string().email("Valid email required").max(160).optional().or(z.literal("")),
    checkIn: z.string().min(1, "Check-in required"),
    checkOut: z.string().min(1, "Check-out required"),
    guests: z.coerce.number().min(1, "At least one guest").max(30),
    roomType: z.string().min(1, "Room type required").max(120),
    language: z.string().min(1, "Preferred language required").max(10),
    contactMethod: z.string().min(1, "Contact method required").max(40),
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
