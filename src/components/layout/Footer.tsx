import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import { siteConfig } from "@/content/siteContent";
import { contact } from "@/content/contact";
import { Wordmark } from "@/components/ui/Wordmark";

export function Footer({ t }: { t: Dictionary }) {
  return (
    <footer className="bg-navy px-4 pb-24 pt-16 text-white md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_.8fr_.8fr]">
        <div>
          <Wordmark tone="light" sub className="text-3xl" />
          <p className="mt-4 max-w-md text-sm leading-6 text-white/65">{t.footer.description}</p>
          {siteConfig.demoMode ? <p className="mt-4 text-xs uppercase tracking-[0.2em] text-champagne">{t.footer.demo}</p> : null}
        </div>
        <div className="grid content-start gap-2.5 text-sm text-white/70">
          <a className="inline-flex items-center gap-2 hover:text-white" href={`tel:${contact.phone.replaceAll(" ", "")}`}>
            <Phone size={16} className="text-champagne" /> {contact.phone}
          </a>
          <a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${contact.email}`}>
            <Mail size={16} className="text-champagne" /> {contact.email}
          </a>
          <a className="inline-flex items-start gap-2 hover:text-white" href={contact.googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <MapPin size={16} className="mt-0.5 shrink-0 text-champagne" /> {contact.address}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {(["rooms", "gallery", "amenities", "location", "faq", "contact"] as const).map((link) => (
            <a className="text-white/75 hover:text-white" href={`/#${link}`} key={link}>
              {t.nav[link]}
            </a>
          ))}
          <Link className="text-white/75 hover:text-white" href="/privacy">
            {t.footer.privacy}
          </Link>
          <Link className="text-white/75 hover:text-white" href="/terms">
            {t.footer.terms}
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-white/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Solief Hotel. {contact.address}</span>
          <a href="/admin/login" className="text-white/55 underline-offset-4 hover:text-white hover:underline">
            {t.footer.staffPortal}
          </a>
        </div>
      </div>
    </footer>
  );
}
