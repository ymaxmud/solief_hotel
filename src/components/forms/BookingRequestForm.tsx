"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Dictionary } from "@/i18n/dictionary";
import { bookingSchema, type BookingFormValues, type QuickBookingValues } from "@/lib/schema";
import { rooms } from "@/content/rooms";
import type { Locale } from "@/types";
import { Button } from "@/components/ui/Button";

export function BookingRequestForm({
  t,
  locale,
  defaults
}: {
  t: Dictionary;
  locale: Locale;
  defaults?: Partial<QuickBookingValues>;
}) {
  const [success, setSuccess] = useState("");
  const [mailto, setMailto] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      checkIn: defaults?.checkIn || "",
      checkOut: defaults?.checkOut || "",
      guests: defaults?.guests || 1,
      roomType: defaults?.roomType || rooms[0].name[locale],
      language: locale.toUpperCase(),
      contactMethod: defaults?.contactMethod || "Phone",
      message: ""
    }
  });

  async function onSubmit(data: BookingFormValues) {
    setSuccess("");
    const response = await fetch("/api/booking-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const json = await response.json();
    if (json.mailto) setMailto(json.mailto);
    setSuccess(t.booking.success);
  }

  const inputClass = "focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white/85 px-3 text-sm text-charcoal";
  const labelClass = "grid gap-1 text-sm font-semibold text-greenGray";
  const contactOptions = [
    { value: "Phone", label: t.booking.contactPhone },
    { value: "Email", label: t.booking.contactEmail },
    { value: "WhatsApp", label: t.actions.whatsapp },
    { value: "Telegram", label: t.actions.telegram }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>{t.booking.name}<input className={inputClass} {...register("name")} /></label>
        <label className={labelClass}>{t.booking.phone}<input className={inputClass} {...register("phone")} /></label>
        <label className={labelClass}>{t.booking.email}<input className={inputClass} type="email" {...register("email")} /></label>
        <label className={labelClass}>{t.booking.guests}<input className={inputClass} type="number" min={1} {...register("guests")} /></label>
        <label className={labelClass}>{t.booking.checkIn}<input className={inputClass} type="date" {...register("checkIn")} /></label>
        <label className={labelClass}>{t.booking.checkOut}<input className={inputClass} type="date" {...register("checkOut")} /></label>
        <label className={labelClass}>
          {t.booking.roomType}
          <select className={inputClass} {...register("roomType")}>
            {rooms.map((room) => <option key={room.id}>{room.name[locale]}</option>)}
          </select>
        </label>
        <label className={labelClass}>
          {t.booking.contactMethod}
          <select className={inputClass} {...register("contactMethod")}>
            {contactOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className={labelClass}>
          {t.booking.language}
          <select className={inputClass} {...register("language")}>
            <option>EN</option>
            <option>RU</option>
            <option>UZ</option>
          </select>
        </label>
      </div>
      <label className={labelClass}>
        {t.booking.message}
        <textarea className={`${inputClass} min-h-28 py-3`} {...register("message")} />
      </label>
      {Object.values(errors).length ? (
        <div className="rounded-lg border border-coralBase/25 bg-coralBase/10 p-3 text-sm text-coralBase">
          {Object.values(errors).map((error, index) => <p key={index}>{error?.message}</p>)}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-hotelBlue/25 bg-hotelBlue/10 p-3 text-sm text-greenGray">
          <p>{success}</p>
          {mailto ? <a className="mt-2 inline-flex items-center gap-2 font-bold text-coralBase" href={mailto}><Mail size={16} /> {t.actions.emailFallback}</a> : null}
        </div>
      ) : null}
      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        <Send size={17} /> {t.actions.submit}
      </Button>
    </form>
  );
}
