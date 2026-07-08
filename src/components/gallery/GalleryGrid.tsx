"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, Images } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import type { HotelImage, Locale } from "@/types";
import { cn } from "@/lib/utils";
import { hotelImages } from "@/content/images";
import { GalleryFilter, type GalleryFilterValue } from "./GalleryFilter";
import { GalleryLightbox } from "./GalleryLightbox";

const storyOrder: GalleryFilterValue[] = ["exterior", "rooms", "bathroom", "dining", "kitchen", "lobby", "amenities", "details"];

export function GalleryGrid({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [filter, setFilter] = useState<GalleryFilterValue>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const images = useMemo(() => getFilteredImages(filter), [filter]);
  const active = images[activeIndex] || images[0];
  const sideImages = useMemo(() => getSideImages(images, activeIndex), [activeIndex, images]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filter]);

  function move(direction: 1 | -1) {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  }

  function openImage(image: HotelImage) {
    const index = images.findIndex((item) => item.id === image.id);
    setLightboxIndex(Math.max(index, 0));
  }

  if (!images.length || !active) {
    return <p className="rounded-lg bg-white/70 p-6 text-center text-slate">{t.gallery.empty}</p>;
  }

  return (
    <>
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <GalleryFilter t={t} active={filter} onChange={setFilter} />
        <p className="max-w-md text-sm leading-6 text-white/64 lg:text-right">{t.gallery.hint}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative overflow-hidden rounded-lg border border-white/15 bg-white/8 shadow-glow">
          <button
            type="button"
            onClick={() => openImage(active)}
            className="focus-ring group relative block aspect-[16/11] w-full overflow-hidden text-left md:aspect-[16/9]"
            aria-label={`${t.actions.openPhoto}: ${active.alt[locale]}`}
          >
            <Image
              key={active.id}
              src={active.src}
              alt={active.alt[locale]}
              fill
              sizes="(min-width: 1024px) 72vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.025]"
              priority={active.priority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/82 via-navy/12 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-champagne px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-navy">
                  {t.gallery.featured}
                </span>
                <span className="rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                  {t.gallery[active.category]}
                </span>
              </div>
              <p className="mt-4 max-w-2xl font-display text-3xl leading-tight text-white md:text-5xl">
                {active.alt[locale]}
              </p>
            </div>
          </button>

          <div className="absolute left-4 top-1/2 flex -translate-y-1/2 gap-2">
            <button type="button" onClick={() => move(-1)} className="focus-ring grid h-11 w-11 place-items-center rounded-full bg-navy/70 text-white backdrop-blur" aria-label={t.actions.previous}>
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="absolute right-4 top-1/2 flex -translate-y-1/2 gap-2">
            <button type="button" onClick={() => move(1)} className="focus-ring grid h-11 w-11 place-items-center rounded-full bg-navy/70 text-white backdrop-blur" aria-label={t.actions.next}>
              <ChevronRight size={20} />
            </button>
          </div>
          <button type="button" onClick={() => openImage(active)} className="focus-ring absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/16 px-4 py-2 text-sm font-bold text-white backdrop-blur" aria-label={t.actions.openPhoto}>
            <Expand size={16} /> {activeIndex + 1} / {images.length}
          </button>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-champagne">
              <Images size={16} /> {t.gallery.story}
            </div>
            <div className="grid gap-3">
              {sideImages.map((image) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() => setActiveIndex(images.findIndex((item) => item.id === image.id))}
                  className="focus-ring group grid grid-cols-[5.5rem_1fr] gap-3 rounded-lg bg-white/8 p-2 text-left transition hover:bg-white/16"
                >
                  <span className="relative aspect-[4/3] overflow-hidden rounded-md">
                    <Image src={image.src} alt={image.alt[locale]} fill sizes="6rem" className="object-cover transition group-hover:scale-105" loading="lazy" />
                  </span>
                  <span className="self-center">
                    <span className="block text-xs font-bold uppercase tracking-[0.16em] text-white/55">{t.gallery[image.category]}</span>
                    <span className="mt-1 line-clamp-2 block text-sm text-white">{image.alt[locale]}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-champagne">{t.gallery.film}</p>
        <div className="flex min-w-0 snap-x gap-3 overflow-x-auto pb-3">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "focus-ring group relative h-24 w-36 shrink-0 snap-start overflow-hidden rounded-lg border transition md:h-28 md:w-44",
                index === activeIndex ? "border-champagne opacity-100" : "border-white/15 opacity-65 hover:opacity-100"
              )}
              aria-label={`${t.actions.openPhoto}: ${image.alt[locale]}`}
            >
              <Image src={image.src} alt={image.alt[locale]} fill sizes="11rem" className="object-cover transition group-hover:scale-105" loading="lazy" />
              <span className="absolute bottom-1 left-1 rounded-full bg-navy/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                {t.gallery[image.category]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {storyOrder.map((category) => {
          const cover = hotelImages.find((image) => image.category === category);
          const count = hotelImages.filter((image) => image.category === category).length;
          if (!cover || !count) return null;
          return (
            <button
              type="button"
              key={category}
              onClick={() => setFilter(category)}
              className={cn(
                "focus-ring group relative aspect-[4/3] overflow-hidden rounded-lg border text-left shadow-soft",
                filter === category ? "border-champagne" : "border-white/12"
              )}
            >
              <Image src={cover.src} alt={cover.alt[locale]} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              <span className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
              <span className="absolute bottom-4 left-4 right-4">
                <span className="block font-display text-2xl text-white">{t.gallery[category]}</span>
                <span className="mt-1 block text-sm text-white/68">{count} {t.gallery.photos}</span>
              </span>
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null ? (
        <GalleryLightbox images={images} index={lightboxIndex} setIndex={setLightboxIndex} onClose={() => setLightboxIndex(null)} locale={locale} t={t} />
      ) : null}
    </>
  );
}

function getFilteredImages(filter: GalleryFilterValue) {
  if (filter === "all") {
    const priority = hotelImages.filter((image) => image.priority);
    const rest = hotelImages.filter((image) => !image.priority);
    return [...priority, ...rest];
  }
  return hotelImages.filter((image) => image.category === filter);
}

function getSideImages(images: HotelImage[], activeIndex: number) {
  if (images.length <= 1) return images;
  return Array.from({ length: Math.min(3, images.length - 1) }, (_, offset) => {
    const nextIndex = (activeIndex + offset + 1) % images.length;
    return images[nextIndex];
  });
}
