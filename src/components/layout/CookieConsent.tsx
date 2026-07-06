"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/types";
import { legalContent } from "@/content/legal";

const STORAGE_KEY = "solief-cookie-consent";

export function CookieConsent({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const copy = legalContent[locale].cookie;

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Storage unavailable: don't block the page, just skip the notice.
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Non-fatal.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 sm:left-4 sm:right-auto sm:max-w-sm">
      <div className="rounded-2xl border border-charcoal/10 bg-white/95 p-4 text-sm text-charcoal shadow-soft backdrop-blur">
        <p className="text-charcoal/80">{copy.text}</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={accept}
            className="focus-ring rounded-full bg-treeGreen px-4 py-2 text-xs font-semibold text-white transition hover:bg-greenGray"
          >
            {copy.accept}
          </button>
          <Link href="/privacy" className="focus-ring text-xs font-semibold text-coralBase underline-offset-4 hover:underline">
            {copy.more}
          </Link>
        </div>
      </div>
    </div>
  );
}
