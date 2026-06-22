"use client";

import { CalendarCheck, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionary";
import { contact } from "@/content/contact";

export function FloatingCTA({ t, onBook }: { t: Dictionary; onBook: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-white/20 bg-treeGreen/90 p-3 backdrop-blur md:hidden">
      <a href={`tel:${contact.phone.replaceAll(" ", "")}`} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white text-charcoal text-sm font-bold">
        <Phone size={17} /> {t.actions.call}
      </a>
      <button type="button" onClick={onBook} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-coralBase text-sm font-bold text-white">
        <CalendarCheck size={17} /> {t.nav.book}
      </button>
    </div>
  );
}
