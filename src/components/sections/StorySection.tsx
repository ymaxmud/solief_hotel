import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { hotelImages } from "@/content/images";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function StorySection({ t, locale }: { t: Dictionary; locale: Locale }) {
  const image = hotelImages.find((item) => item.category === "lobby") || hotelImages[2];
  return (
    <section className="px-4 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[.9fr_1.1fr] md:items-center">
        <div>
          <SectionHeading title={t.sections.story} />
          <p className="text-xl leading-9 text-greenGray">{t.story}</p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-glow md:aspect-[5/4]">
          <Image src={image.src} alt={image.alt[locale]} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
