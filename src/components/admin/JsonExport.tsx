"use client";

import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n/dictionary";

export function JsonExport({ t, value, onImport }: { t: Dictionary; value: string; onImport: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={() => navigator.clipboard.writeText(value)}>{t.actions.export}</Button>
      <label className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-treeGreen px-5 py-2.5 text-sm font-semibold text-white">
        {t.actions.import}
        <input className="sr-only" type="file" accept="application/json" onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) onImport(await file.text());
        }} />
      </label>
    </div>
  );
}
