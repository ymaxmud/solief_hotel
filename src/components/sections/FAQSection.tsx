"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { faqs } from "@/content/faq";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FAQSection({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <SectionHeading title={t.sections.faq} />
        <div className="grid gap-3">
          {faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <div key={faq.question.en} className="rounded-lg border border-charcoal/10 bg-white/75 shadow-soft">
                <button
                  className="focus-ring flex w-full items-center justify-between gap-4 p-5 text-left font-bold"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  {faq.question[locale]} <ChevronDown className={isOpen ? "rotate-180 transition" : "transition"} />
                </button>
                {isOpen ? <p id={`faq-answer-${index}`} className="px-5 pb-5 text-slate">{faq.answer[locale]}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
