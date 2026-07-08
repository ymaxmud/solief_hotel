"use client";

import Image from "next/image";
import { BedDouble, Users, Maximize, Coffee, CalendarCheck, CreditCard } from "lucide-react";
import type { Currency, Locale, Room } from "@/types";
import type { Dictionary } from "@/i18n/dictionary";
import { amenityLabel } from "@/content/roomAmenities";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/Button";

const AMENITY_PREVIEW = ["wifi", "breakfastBuffet", "ac", "smartTv", "safe"];

export function RoomCard({
  room,
  t,
  locale,
  currency,
  onViewDetails,
  onBook
}: {
  room: Room;
  t: Dictionary;
  locale: Locale;
  currency: Currency;
  onViewDetails: (room: Room) => void;
  onBook: (room: Room) => void;
}) {
  const image = room.images[0];
  const previewKeys = AMENITY_PREVIEW.filter((key) => room.amenityKeys.includes(key));
  const extraCount = room.amenityKeys.length - previewKeys.length;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
      <button
        type="button"
        onClick={() => onViewDetails(room)}
        className="focus-ring relative aspect-[4/3] overflow-hidden"
        aria-label={`${t.room.viewDetails}: ${room.name[locale]}`}
      >
        <Image
          src={image.src}
          alt={image.alt[locale]}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {room.areaSqm} m² · {room.capacity} {t.room.maxGuests}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl text-ink">{room.name[locale]}</h3>

        <div className="mt-3 grid gap-1.5 text-sm text-slate">
          <span className="inline-flex items-center gap-2"><Users size={15} className="text-champagne" /> {t.room.maxGuests}: {room.capacity}</span>
          <span className="inline-flex items-center gap-2"><Maximize size={15} className="text-champagne" /> {t.room.area}: {room.areaSqm} m²</span>
          <span className="inline-flex items-center gap-2"><BedDouble size={15} className="text-champagne" /> {room.bedType[locale]}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {room.breakfastIncluded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-slate"><Coffee size={13} /> {t.room.breakfastIncluded}</span>
          ) : null}
          {room.freeCancellation ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-slate"><CalendarCheck size={13} /> {t.room.freeCancellation}</span>
          ) : null}
          {room.noCreditCard ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-slate"><CreditCard size={13} /> {t.room.noCreditCard}</span>
          ) : null}
        </div>

        <p className="mt-4 text-sm leading-6 text-muted">
          {previewKeys.map((key) => amenityLabel(key, locale)).join(" · ")}
          {extraCount > 0 ? (
            <button
              type="button"
              onClick={() => onViewDetails(room)}
              className="focus-ring ml-1 font-semibold text-oxford underline underline-offset-2 hover:text-navy"
            >
              +{extraCount} {t.room.moreAmenities}
            </button>
          ) : null}
        </p>

        <div className="mt-auto pt-5">
          <p className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-ink">{formatPrice(room.priceUzs, currency, locale)}</span>
            <span className="text-xs text-muted">{t.room.perNight}</span>
          </p>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="light" onClick={() => onViewDetails(room)} className="flex-1">{t.room.viewDetails}</Button>
            <Button type="button" onClick={() => onBook(room)} className="flex-1">{t.room.requestRoom}</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
