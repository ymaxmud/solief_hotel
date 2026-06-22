"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import type { HotelImage, Locale } from "@/types";
import type { Dictionary } from "@/i18n/dictionary";

export function GalleryLightbox({ images, index, setIndex, onClose, locale, t }: { images: HotelImage[]; index: number; setIndex: (index: number) => void; onClose: () => void; locale: Locale; t: Dictionary }) {
  const image = images[index];
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setIndex((index + 1) % images.length);
      if (event.key === "ArrowLeft") setIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, index, onClose, setIndex]);

  if (!image) return null;
  return (
    <div className="fixed inset-0 z-[85] grid place-items-center bg-treeGreen/92 p-4 text-white backdrop-blur" role="dialog" aria-modal="true">
      <button className="focus-ring absolute right-4 top-4 rounded-full bg-white/10 p-3" onClick={onClose} aria-label={t.actions.close}><X /></button>
      <button className="focus-ring absolute left-4 top-1/2 rounded-full bg-white/10 p-3" onClick={() => setIndex((index - 1 + images.length) % images.length)} aria-label={t.actions.previous}><ChevronLeft /></button>
      <figure className="w-full max-w-5xl">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-white/5">
          <Image src={image.src} alt={image.alt[locale]} fill sizes="90vw" className="object-contain" />
        </div>
        <figcaption className="mt-3 text-center text-sm text-white/70">{index + 1} / {images.length} · {image.alt[locale]}</figcaption>
      </figure>
      <button className="focus-ring absolute right-4 top-1/2 rounded-full bg-white/10 p-3" onClick={() => setIndex((index + 1) % images.length)} aria-label={t.actions.next}><ChevronRight /></button>
    </div>
  );
}
