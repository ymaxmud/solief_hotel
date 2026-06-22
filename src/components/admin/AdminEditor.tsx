"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionary";
import { siteConfig } from "@/content/siteContent";
import { rooms } from "@/content/rooms";
import { amenities } from "@/content/amenities";
import { faqs } from "@/content/faq";
import { reviews } from "@/content/reviews";
import { Button } from "@/components/ui/Button";
import { JsonExport } from "./JsonExport";

const defaultData = { siteConfig, rooms, amenities, faqs, reviews };

export function AdminEditor({ t }: { t: Dictionary }) {
  const [json, setJson] = useState(JSON.stringify(defaultData, null, 2));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("solief-admin-demo");
    if (stored) setJson(stored);
  }, []);

  function save() {
    JSON.parse(json);
    localStorage.setItem("solief-admin-demo", json);
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="font-display text-5xl">{t.admin.title}</h1>
      <p className="mt-3 max-w-2xl text-greenGray">{t.admin.intro}</p>
      <div className="mt-8 rounded-lg border border-charcoal/10 bg-white/85 p-5 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl">{t.admin.content}</h2>
          <JsonExport t={t} value={json} onImport={setJson} />
        </div>
        <textarea className="focus-ring min-h-[60vh] w-full rounded-lg border border-charcoal/15 bg-[#fbfaf7] p-4 font-mono text-xs" value={json} onChange={(event) => setJson(event.target.value)} />
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={save}>{t.actions.submit}</Button>
          <Button type="button" variant="light" onClick={() => { localStorage.removeItem("solief-admin-demo"); setJson(JSON.stringify(defaultData, null, 2)); }}>{t.actions.reset}</Button>
        </div>
        {saved ? <p className="mt-3 text-sm font-bold text-hotelBlue">{t.admin.saved}</p> : null}
      </div>
    </main>
  );
}
