"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { rooms } from "@/content/rooms";
import { contact } from "@/content/contact";
import { quickBookingSchema, type QuickBookingValues } from "@/lib/schema";
import { Button } from "@/components/ui/Button";

export function BookingBar({
  t,
  locale,
  onSubmit
}: {
  t: Dictionary;
  locale: Locale;
  onSubmit: (values: QuickBookingValues) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<QuickBookingValues>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: { guests: 1, roomType: rooms[0].name[locale], contactMethod: "Phone" }
  });
  const input = "focus-ring min-h-11 rounded-lg border border-white/25 bg-white/85 px-3 text-sm text-charcoal";
  const contactOptions = [
    { value: "Phone", label: t.booking.contactPhone },
    { value: "Email", label: t.booking.contactEmail },
    contact.whatsappUrl ? { value: "WhatsApp", label: t.actions.whatsapp } : null,
    contact.telegramUrl ? { value: "Telegram", label: t.actions.telegram } : null
  ].filter((option): option is { value: string; label: string } => Boolean(option));
  const errorMessage = errors.checkOut ? t.booking.dateOrder : Object.keys(errors).length ? t.booking.checkFields : "";

  return (
    <section className="sticky top-[72px] z-30 hidden px-4 md:block" aria-label={t.booking.title}>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto grid max-w-7xl grid-cols-[repeat(5,minmax(0,1fr))_auto] gap-2 rounded-lg border border-white/35 bg-navy/82 p-3 shadow-glow backdrop-blur-xl">
        <input aria-label={t.booking.checkIn} className={input} type="date" {...register("checkIn")} />
        <input aria-label={t.booking.checkOut} className={input} type="date" {...register("checkOut")} />
        <input aria-label={t.booking.guests} className={input} type="number" min={1} {...register("guests")} />
        <select aria-label={t.booking.roomType} className={input} {...register("roomType")}>
          {rooms.map((room) => <option key={room.id}>{room.name[locale]}</option>)}
        </select>
        <select aria-label={t.booking.contactMethod} className={input} {...register("contactMethod")}>
          {contactOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <Button type="submit" className="px-4"><CalendarCheck size={17} /> {t.booking.openForm}</Button>
        {errorMessage ? <p className="col-span-full text-xs font-bold text-champagne">{errorMessage}</p> : null}
      </form>
    </section>
  );
}
