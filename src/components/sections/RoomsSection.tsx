"use client";

import Image from "next/image";
import { BedDouble, Users } from "lucide-react";
import type { Currency, Locale } from "@/types";
import type { Dictionary } from "@/i18n/dictionary";
import { rooms } from "@/content/rooms";
import { hotelImages } from "@/content/images";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function RoomsSection({ t, locale, currency, onBook }: { t: Dictionary; locale: Locale; currency: Currency; onBook: () => void }) {
  return (
    <section id="rooms" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={t.sections.rooms} />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {rooms.map((room) => {
            const image = hotelImages.find((item) => item.id === room.imageId) || hotelImages[0];
            return (
              <article key={room.id} className="group overflow-hidden rounded-lg border border-charcoal/10 bg-white/78 shadow-soft backdrop-blur">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={image.src} alt={image.alt[locale]} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <Badge>{t.room.bestFor}: {room.bestFor[locale]}</Badge>
                  <h3 className="mt-4 font-display text-2xl text-charcoal">{room.name[locale]}</h3>
                  <p className="mt-2 text-sm leading-6 text-greenGray">{room.description[locale]}</p>
                  <div className="mt-4 grid gap-2 text-sm text-greenGray">
                    <span className="inline-flex items-center gap-2"><Users size={16} /> {room.capacity} {t.room.capacity}</span>
                    <span className="inline-flex items-center gap-2"><BedDouble size={16} /> {room.beds[locale]}</span>
                  </div>
                  <p className="mt-5 text-lg font-bold text-coralBase">{t.room.priceFrom} {formatPrice(room.priceUzs, currency, locale)}</p>
                  <p className="text-xs text-greenGray/70">{room.priceNote[locale]}</p>
                  <Button onClick={onBook} className="mt-5 w-full">{t.actions.request}</Button>
                </div>
              </article>
            );
          })}
        </div>
        <RoomComparison t={t} locale={locale} onBook={onBook} />
      </div>
    </section>
  );
}

function RoomComparison({ t, locale, onBook }: { t: Dictionary; locale: Locale; onBook: () => void }) {
  return (
    <div className="mt-14">
      <h3 className="mb-5 font-display text-3xl text-charcoal">{t.sections.compare}</h3>
      <div className="hidden overflow-hidden rounded-lg border border-charcoal/10 bg-white/75 shadow-soft md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-greenGray text-white">
            <tr>{[t.booking.roomType, t.room.capacity, t.room.beds, t.room.breakfast, t.room.wifi, t.room.ac, t.room.bathroom, t.room.bestFor, ""].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-t border-charcoal/10">
                <td className="p-3 font-bold">{room.name[locale]}</td><td className="p-3">{room.capacity}</td><td className="p-3">{room.beds[locale]}</td><td className="p-3">✓</td><td className="p-3">✓</td><td className="p-3">✓</td><td className="p-3">✓</td><td className="p-3">{room.bestFor[locale]}</td><td className="p-3"><Button onClick={onBook} className="px-3 py-2 text-xs">{t.actions.request}</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid snap-x grid-flow-col gap-4 overflow-x-auto md:hidden">
        {rooms.map((room) => (
          <div key={room.id} className="w-72 snap-start rounded-lg bg-white/80 p-4 shadow-soft">
            <h4 className="font-display text-xl">{room.name[locale]}</h4>
            <p className="mt-2 text-sm">{room.capacity} {t.room.capacity} · {room.beds[locale]}</p>
            <p className="mt-2 text-sm">{t.room.bestFor}: {room.bestFor[locale]}</p>
            <Button onClick={onBook} className="mt-4 w-full">{t.actions.request}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
