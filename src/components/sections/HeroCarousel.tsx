"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { heroSlides } from "@/content/images";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 7000;
const SWIPE_THRESHOLD = 40;

/**
 * "Atelier frame" hero carousel — the photo sits in an arched gallery frame
 * (white mat + champagne keyline + offset backing panel) and slides cross-fade
 * with a slow cinematic zoom. Slides are stacked absolute layers (no sliding
 * track), so the page can never shift sideways on touch.
 */
export function HeroCarousel({ t, locale }: { t: Dictionary; locale: Locale }) {
  const count = heroSlides.length;
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((dir: 1 | -1) => setIndex((p) => (p + dir + count) % count), [count]);
  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

  const arch = "rounded-t-[8.5rem] rounded-b-xl sm:rounded-t-[11rem] xl:rounded-t-[12rem]";
  const active = heroSlides[index];

  return (
    <div className="relative">
      <div
        className="relative"
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
        <div className="relative">
          {/* Offset backing panel — layered gallery depth behind the frame only. */}
          <div aria-hidden className={cn("absolute -bottom-3.5 -right-3.5 left-3.5 top-3.5 border border-champagne/35 bg-mist", arch)} />

          {/* White mat around the arched clip, like a framed print. */}
          <div className={cn("relative border border-line bg-white p-2.5 shadow-glow sm:p-3", arch)}>
          <div className={cn("relative aspect-[4/5] w-full max-w-full overflow-hidden sm:aspect-[7/8] lg:aspect-[6/7]", arch)}>
            {heroSlides.map((slide, i) => (
              <div
                key={slide.id}
                aria-hidden={i !== index}
                className={cn(
                  "absolute inset-0 overflow-hidden transition-opacity duration-[900ms] ease-out motion-reduce:transition-none",
                  i === index ? "opacity-100" : "pointer-events-none opacity-0"
                )}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt[locale]}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 42vw, 92vw"
                  className={cn(
                    "object-cover [filter:saturate(.8)_contrast(1.04)]",
                    i === index && "hero-kenburns motion-reduce:animate-none"
                  )}
                  style={{ objectPosition: slide.objectPosition || "50% 50%" }}
                />
                {/* Unified navy grade + soft base scrim — makes the mixed photos read as one set. */}
                <div className="absolute inset-0 bg-navy/[0.08] mix-blend-multiply" />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-navy/25 to-transparent" />
              </div>
            ))}

            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t.actions.previous}
                  className="focus-ring absolute bottom-4 left-4 grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-navy/25 text-white backdrop-blur transition hover:border-champagne hover:text-champagne"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t.actions.next}
                  className="focus-ring absolute bottom-4 left-[4.25rem] ml-2 grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-navy/25 text-white backdrop-blur transition hover:border-champagne hover:text-champagne"
                >
                  <ChevronRight size={17} />
                </button>
              </>
            ) : null}
          </div>

          {/* Inset champagne keyline over the photo edge. */}
          <div aria-hidden className={cn("pointer-events-none absolute inset-2.5 border border-champagne/45 sm:inset-3", arch)} />
          </div>
        </div>

        {/* Caption rail — serif caption, editorial counter, thin progress bars. */}
        <div className="mt-6 border-t border-line pt-3">
          <div className="flex items-baseline justify-between gap-4">
            <p aria-live="polite" className="min-w-0 truncate font-display text-lg italic text-ink">
              {active.caption[locale]}
            </p>
            <p className="shrink-0 font-display text-sm tabular-nums text-slate">
              {String(index + 1).padStart(2, "0")}
              <span className="mx-1.5 text-champagne">—</span>
              {String(count).padStart(2, "0")}
            </p>
          </div>
          {count > 1 ? (
            <div className="mt-3 flex gap-1.5">
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${t.hero.carouselLabel} ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "focus-ring h-1 rounded-full transition-all duration-300",
                    i === index ? "w-8 bg-champagne" : "w-4 bg-line hover:bg-slate/40"
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
