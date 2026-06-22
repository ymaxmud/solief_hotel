import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Ornament } from "@/components/ui/Ornament";

export function GallerySection({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="gallery" className="scroll-mt-40 bg-treeGreen px-4 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="relative mx-auto mb-12 max-w-3xl text-center">
          <Ornament className="absolute left-1/2 top-0 -z-0 h-24 w-64 -translate-x-1/2 opacity-15" />
          <p className="relative mb-3 text-xs font-bold uppercase tracking-[0.24em] text-warmSand">{t.actions.viewPhotos}</p>
          <h2 className="relative font-display text-3xl leading-tight text-white md:text-5xl">{t.sections.gallery}</h2>
        </div>
        <GalleryGrid t={t} locale={locale} />
      </div>
    </section>
  );
}
