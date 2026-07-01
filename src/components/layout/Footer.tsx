import { MapPin, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import { siteConfig } from "@/content/siteContent";
import { contact } from "@/content/contact";

export function Footer({ t }: { t: Dictionary }) {
  return (
    <footer className="bg-treeGreen px-4 pb-24 pt-14 text-white md:pb-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_.8fr_.8fr]">
        <div>
          <p className="font-display text-3xl">Solief Hotel</p>
          <p className="mt-3 max-w-md text-white/70">{t.footer.description}</p>
          {siteConfig.demoMode ? <p className="mt-4 text-xs uppercase tracking-[0.2em] text-warmSand">{t.footer.demo}</p> : null}
        </div>
        <div className="grid gap-2 text-sm text-white/75">
          <a className="inline-flex items-center gap-2 hover:text-white" href={`tel:${contact.phone.replaceAll(" ", "")}`}>
            <Phone size={16} /> {contact.phone}
          </a>
          <a className="inline-flex items-center gap-2 hover:text-white" href={contact.googleMapsUrl} target="_blank">
            <MapPin size={16} /> {contact.address}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {(["rooms", "gallery", "amenities", "location", "faq", "contact"] as const).map((link) => (
            <a className="text-white/75 hover:text-white" href={`#${link}`} key={link}>
              {t.nav[link]}
            </a>
          ))}
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
