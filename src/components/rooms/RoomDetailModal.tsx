"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Maximize, BedDouble, Coffee, CalendarCheck, CreditCard, Clock, PawPrint, Ban, Check } from "lucide-react";
import type { Currency, Locale, Room } from "@/types";
import type { Dictionary } from "@/i18n/dictionary";
import { groupRoomAmenities } from "@/content/roomAmenities";
import { siteConfig } from "@/content/siteContent";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function RoomDetailModal({
  room,
  t,
  locale,
  currency,
  onClose,
  onBook
}: {
  room: Room | null;
  t: Dictionary;
  locale: Locale;
  currency: Currency;
  onClose: () => void;
  onBook: (room: Room) => void;
}) {
  if (!room) return null;
  return (
    <Modal open onClose={onClose} title={room.name[locale]} closeLabel={t.actions.close}>
      {/* key resets the gallery state when switching rooms */}
      <RoomDetailBody key={room.id} room={room} t={t} locale={locale} currency={currency} onBook={onBook} />
    </Modal>
  );
}

function RoomDetailBody({
  room,
  t,
  locale,
  currency,
  onBook
}: {
  room: Room;
  t: Dictionary;
  locale: Locale;
  currency: Currency;
  onBook: (room: Room) => void;
}) {
  const [active, setActive] = useState(0);
  const groups = groupRoomAmenities(room.amenityKeys, locale);
  const activeImage = room.images[active] ?? room.images[0];

  return (
    <div className="grid min-w-0 gap-5">
      {/* Gallery */}
      <div className="min-w-0">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
          <Image src={activeImage.src} alt={activeImage.alt[locale]} fill sizes="(min-width: 768px) 640px, 100vw" className="object-cover" />
        </div>
        {room.images.length > 1 ? (
          <div className="mt-3 flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label={t.room.gallery}>
            {room.images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${t.room.gallery} ${index + 1}`}
                aria-current={index === active}
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${index === active ? "border-oxford" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <Image src={image.src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="text-sm leading-6 text-slate">{room.description[locale]}</p>

      {/* Facts */}
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact icon={<Users size={16} />} label={t.room.maxGuests} value={String(room.capacity)} />
        <Fact icon={<Maximize size={16} />} label={t.room.area} value={`${room.areaSqm} m²`} />
        <Fact icon={<BedDouble size={16} />} label={t.room.bed} value={room.bedType[locale]} />
        <Fact icon={null} label={t.room.priceFrom} value={`${formatPrice(room.priceUzs, currency, locale)} / ${t.room.perNight}`} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {room.breakfastIncluded ? <Pill icon={<Coffee size={13} />} text={t.room.breakfastIncluded} /> : null}
        {room.freeCancellation ? <Pill icon={<CalendarCheck size={13} />} text={t.room.freeCancellation} /> : null}
        {room.noCreditCard ? <Pill icon={<CreditCard size={13} />} text={t.room.noCreditCard} /> : null}
        {room.noSmoking ? <Pill icon={<Ban size={13} />} text={t.room.noSmoking} /> : null}
      </div>

      {/* Amenities grouped */}
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.category} className="min-w-0">
            <h3 className="font-display text-lg text-ink">{group.label}</h3>
            <ul className="mt-2 grid gap-1.5 text-sm text-slate">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-champagne" /> <span className="min-w-0">{item}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Conditions */}
      <div className="rounded-xl border border-charcoal/10 bg-mist/50 p-4">
        <h3 className="font-display text-lg text-charcoal">{t.room.conditions}</h3>
        <ul className="mt-2 grid gap-1.5 text-sm text-slate sm:grid-cols-2">
          <li className="inline-flex items-center gap-2"><Clock size={14} /> {t.room.checkInFrom} {siteConfig.checkIn}</li>
          <li className="inline-flex items-center gap-2"><Clock size={14} /> {t.room.checkOutUntil} {siteConfig.checkOut}</li>
          <li className="inline-flex items-center gap-2"><PawPrint size={14} /> {t.room.petsNotAllowed}</li>
          <li className="inline-flex items-center gap-2"><Ban size={14} /> {t.room.noSmoking}</li>
        </ul>
        <p className="mt-3 text-xs text-muted">{t.room.cancellationNote}</p>
      </div>

      <Button type="button" onClick={() => onBook(room)} className="w-full">{t.room.bookRoom}</Button>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-white p-3">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-slate">{icon} {text}</span>
  );
}
