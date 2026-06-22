"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n/dictionary";

export function AdminLogin({ t, onSuccess }: { t: Dictionary; onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const expected = process.env.NEXT_PUBLIC_ADMIN_DEMO_PASSCODE || "solief-demo";
  return (
    <form className="mx-auto mt-20 max-w-md rounded-lg bg-white/85 p-6 shadow-soft" onSubmit={(event) => { event.preventDefault(); if (code === expected) onSuccess(); }}>
      <h1 className="font-display text-4xl">{t.admin.title}</h1>
      <p className="mt-3 text-sm text-greenGray">{t.admin.intro}</p>
      <label className="mt-6 grid gap-2 text-sm font-bold">{t.admin.passcode}<input className="focus-ring min-h-11 rounded-lg border border-charcoal/15 px-3" value={code} onChange={(event) => setCode(event.target.value)} type="password" /></label>
      <Button className="mt-5 w-full">{t.admin.login}</Button>
    </form>
  );
}
