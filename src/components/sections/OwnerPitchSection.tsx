import { CheckCircle2 } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import { siteConfig } from "@/content/siteContent";

export function OwnerPitchSection({ t }: { t: Dictionary }) {
  if (!siteConfig.showOwnerPitch) return null;
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-7xl rounded-lg border border-hotelBlue/20 bg-white/70 p-6 shadow-soft backdrop-blur md:p-8">
        <div className="grid gap-6 md:grid-cols-[.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-coralBase">{t.owner.title}</p>
            <h2 className="mt-3 font-display text-3xl text-charcoal md:text-4xl">{t.owner.subtitle}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {t.owner.items.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-softWhite/70 p-3 text-sm font-semibold text-greenGray">
                <CheckCircle2 size={18} className="text-hotelBlue" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
