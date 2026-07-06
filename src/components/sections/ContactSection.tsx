import { Mail, MapPin, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/types";
import { contact } from "@/content/contact";
import { ContactForm } from "@/components/forms/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export function ContactSection({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="contact" className="bg-softWhite px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={t.sections.contact}>
          <span>{t.contact.subtitle}</span>
        </SectionHeading>
        <div className="grid gap-6 md:grid-cols-[.85fr_1.15fr]">
          <div className="rounded-lg bg-treeGreen p-6 text-white shadow-glow">
            <h3 className="font-display text-3xl">{t.contact.title}</h3>
            <div className="mt-6 grid gap-4 text-white/80">
              <a href={`tel:${contact.phone.replaceAll(" ", "")}`} className="inline-flex items-center gap-3"><Phone /> {contact.phone}</a>
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-3"><Mail /> {contact.email}</a>
              <a href={contact.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3"><MapPin /> {contact.address}</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <ButtonLink href={contact.googleMapsUrl} target="_blank">{t.actions.map}</ButtonLink>
              {/* Hide unconfigured channels rather than showing a "coming soon" label. */}
              {contact.whatsappUrl ? <ButtonLink href={contact.whatsappUrl} variant="ghost">{t.actions.whatsapp}</ButtonLink> : null}
              {contact.telegramUrl ? <ButtonLink href={contact.telegramUrl} variant="ghost">{t.actions.telegram}</ButtonLink> : null}
            </div>
          </div>
          <div className="rounded-lg border border-charcoal/10 bg-white/85 p-5 shadow-soft md:p-7">
            <ContactForm t={t} locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
