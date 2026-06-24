"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminDictionary } from "@/i18n/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminLoginForm({ t }: { t: AdminDictionary }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push(searchParams.get("next") || "/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <label className="grid gap-1 text-sm font-bold text-greenGray">
        {t.email}
        <input className="focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white px-3" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </label>
      <label className="grid gap-1 text-sm font-bold text-greenGray">
        {t.password}
        <input className="focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white px-3" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
      </label>
      {error ? <p className="rounded-lg bg-coralBase/10 p-3 text-sm text-coralBase">{error}</p> : null}
      <button disabled={loading} className="rounded-full bg-coralBase px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {loading ? "..." : t.login}
      </button>
    </form>
  );
}
