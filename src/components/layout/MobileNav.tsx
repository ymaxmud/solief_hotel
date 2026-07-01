"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import { Button } from "@/components/ui/Button";

const links = ["rooms", "gallery", "amenities", "location", "reviews", "faq", "contact"] as const;

export function MobileNav({ t, onBook }: { t: Dictionary; onBook: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button className="focus-ring rounded-full bg-white/15 p-2 text-white backdrop-blur" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu size={22} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[90] bg-treeGreen/95 p-5 text-white">
          <div className="flex items-center justify-between">
            <p className="font-display text-2xl">Solief Hotel</p>
            <button className="focus-ring rounded-full bg-white/10 p-2" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
          </div>
          <nav className="mt-10 grid gap-3">
            {links.map((link) => (
              <a key={link} href={`#${link}`} onClick={() => setOpen(false)} className="rounded-lg border border-white/10 p-4 text-lg">
                {t.nav[link]}
              </a>
            ))}
          </nav>
          <Button className="mt-6 w-full" onClick={() => { setOpen(false); onBook(); }}>
            {t.nav.book}
          </Button>
          <a href="/admin/login" onClick={() => setOpen(false)} className="mt-4 block rounded-lg border border-white/10 p-3 text-center text-sm font-semibold text-white/65">
            {t.footer.staffPortal}
          </a>
        </div>
      ) : null}
    </div>
  );
}
