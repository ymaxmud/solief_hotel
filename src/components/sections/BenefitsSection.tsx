import { CheckCircle2 } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function BenefitsSection({ t }: { t: Dictionary }) {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={t.sections.benefits} />
        <div className="grid gap-4 md:grid-cols-3">
          {t.benefits.map((benefit) => (
            <div key={benefit} className="rounded-lg bg-white/78 p-5 shadow-soft">
              <CheckCircle2 className="text-coralBase" />
              <p className="mt-4 font-bold text-charcoal">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
