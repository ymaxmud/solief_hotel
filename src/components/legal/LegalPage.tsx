"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/types";
import { getDictionary } from "@/i18n/dictionary";
import { siteConfig } from "@/content/siteContent";
import { legalContent, legalLastUpdated } from "@/content/legal";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";

const SUPPORTED_LOCALES: Locale[] = ["en", "ru", "uz"];

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as string[]).includes(value);
}

export function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const [locale, setLocaleState] = useState<Locale>(siteConfig.defaultLocale);
  const t = useMemo(() => getDictionary(locale), [locale]);
  const bundle = legalContent[locale];
  const content = bundle[doc];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    const stored = window.localStorage.getItem("solief-locale");
    const initial = isLocale(fromUrl) ? fromUrl : isLocale(stored) ? stored : siteConfig.defaultLocale;
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem("solief-locale", next);
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      window.history.replaceState(null, "", url.toString());
    } catch {
      // Non-fatal: locale still applies in-memory.
    }
  }, []);

  return (
    <>
      <header className="border-b border-charcoal/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="focus-ring font-display text-xl font-semibold text-treeGreen">
            Solief Hotel
          </Link>
          <div className="flex items-center gap-1" role="group" aria-label="Language">
            {SUPPORTED_LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                aria-pressed={locale === code}
                className={`focus-ring rounded-full px-3 py-1 text-xs font-semibold uppercase transition ${
                  locale === code ? "bg-treeGreen text-white" : "text-charcoal/60 hover:text-charcoal"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14">
        <Link href="/" className="focus-ring text-sm text-coralBase underline-offset-4 hover:underline">
          ← {bundle.ui.backHome}
        </Link>
        <h1 className="mt-6 font-display text-3xl font-semibold text-treeGreen sm:text-4xl">{content.title}</h1>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-charcoal/50">
          {bundle.ui.lastUpdated}: {legalLastUpdated}
        </p>
        <p className="mt-6 text-charcoal/80">{content.intro}</p>

        <div className="mt-8 space-y-8">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-semibold text-treeGreen">{section.heading}</h2>
              <div className="mt-3 space-y-2 text-charcoal/75">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer t={t} />
      <CookieConsent locale={locale} />
    </>
  );
}
