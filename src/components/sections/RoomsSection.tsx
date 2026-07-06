"use client";

import { useState } from "react";
import type { Currency, Locale, Room } from "@/types";
import type { QuickBookingValues } from "@/lib/schema";
import type { Dictionary } from "@/i18n/dictionary";
import { rooms } from "@/content/rooms";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RoomCard } from "@/components/rooms/RoomCard";
import { RoomDetailModal } from "@/components/rooms/RoomDetailModal";

type BookHandler = (defaults?: Partial<QuickBookingValues>) => void;

export function RoomsSection({ t, locale, currency, onBook }: { t: Dictionary; locale: Locale; currency: Currency; onBook: BookHandler }) {
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);

  // Preselect the chosen room (and its capacity) in the booking form, and close
  // the detail modal if it was open.
  function book(room: Room) {
    setDetailRoom(null);
    onBook({ roomType: room.name[locale], guests: room.capacity });
  }

  return (
    <section id="rooms" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={t.sections.rooms} />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} t={t} locale={locale} currency={currency} onViewDetails={setDetailRoom} onBook={book} />
          ))}
        </div>
        <RoomComparison t={t} locale={locale} currency={currency} onBook={book} />
      </div>
      <RoomDetailModal room={detailRoom} t={t} locale={locale} currency={currency} onClose={() => setDetailRoom(null)} onBook={book} />
    </section>
  );
}

function RoomComparison({ t, locale, currency, onBook }: { t: Dictionary; locale: Locale; currency: Currency; onBook: (room: Room) => void }) {
  const headers = [t.booking.roomType, t.room.maxGuests, t.room.area, t.room.bed, t.room.breakfast, t.room.priceFrom, ""];
  return (
    <div className="mt-14">
      <h3 className="mb-5 font-display text-3xl text-charcoal">{t.sections.compare}</h3>
      <div className="hidden overflow-hidden rounded-2xl border border-charcoal/10 bg-white/75 shadow-soft md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-greenGray text-white">
            <tr>{headers.map((h, index) => <th key={h || `col-${index}`} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-t border-charcoal/10">
                <td className="p-3 font-bold">{room.name[locale]}</td>
                <td className="p-3">{room.capacity}</td>
                <td className="p-3">{room.areaSqm} m²</td>
                <td className="p-3">{room.bedType[locale]}</td>
                <td className="p-3">{room.breakfastIncluded ? "✓" : "—"}</td>
                <td className="p-3 font-semibold text-coralBase">{formatPrice(room.priceUzs, currency, locale)}</td>
                <td className="p-3"><Button onClick={() => onBook(room)} className="px-3 py-2 text-xs">{t.room.bookRoom}</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid snap-x grid-flow-col gap-4 overflow-x-auto md:hidden">
        {rooms.map((room) => (
          <div key={room.id} className="w-72 snap-start rounded-2xl bg-white/80 p-4 shadow-soft">
            <h4 className="font-display text-xl">{room.name[locale]}</h4>
            <p className="mt-2 text-sm text-greenGray">{room.capacity} {t.room.maxGuests} · {room.areaSqm} m² · {room.bedType[locale]}</p>
            <p className="mt-2 text-lg font-bold text-coralBase">{formatPrice(room.priceUzs, currency, locale)} <span className="text-xs font-normal text-greenGray/70">{t.room.perNight}</span></p>
            <Button onClick={() => onBook(room)} className="mt-4 w-full">{t.room.bookRoom}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
