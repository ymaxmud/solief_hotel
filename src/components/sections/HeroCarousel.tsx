"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { heroSlides } from "@/content/images";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 40;

/**
 * Boutique hero carousel. A contained CSS-transform track (not a draggable
 * surface) so the page can never shift sideways on touch. The viewport clips
 * overflow and the aspect ratio is locked to prevent layout jump / CLS.
 */
export function HeroCarousel({ t, locale }: { t: Dictionary; locale: Locale }) {
  const count = heroSlides.length;
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const reduced = useRef(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((dir: 1 | -1) => setIndex((p) => (p + dir + count) % count), [count]);
  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current || count <= 1) return;
    const id = window.setInterval(() => {
      if (!paused.current && document.visibilityState === "visible") {
        setIndex((p) => (p + 1) % count);
      }
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  };

  return (
    <div
      className="relative w-full max-w-full overflow-hidden rounded-2xl border border-line bg-white shadow-glow"
      role="region"
      aria-roledescription="carousel"
      aria-label={t.hero.carouselLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      onTouchStart={(e) => (touchStartX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const delta = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        if (Math.abs(delta) > SWIPE_THRESHOLD) go(delta < 0 ? 1 : -1);
        touchStartX.current = null;
      }}
    >
      <div className="aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] xl:aspect-[9/10]">
        <div
          className="flex h-full min-w-0 transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {heroSlides.map((slide, i) => (
            <div key={slide.id} className="relative h-full flex-[0_0_100%] min-w-full" aria-hidden={i !== index}>
              <Image
                src={slide.src}
                alt={slide.alt[locale]}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Soft top-and-bottom scrim so controls stay legible over any photo. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/45 to-transparent" />

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t.actions.previous}
            className="focus-ring absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-navy/45 text-white backdrop-blur transition hover:bg-navy/70"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t.actions.next}
            className="focus-ring absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-navy/45 text-white backdrop-blur transition hover:bg-navy/70"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {heroSlides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${t.hero.carouselLabel} ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-champagne" : "w-1.5 bg-white/70 hover:bg-white"
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
