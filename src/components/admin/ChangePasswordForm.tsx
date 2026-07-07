"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminDictionary } from "@/i18n/admin";

export function ChangePasswordForm({ t }: { t: AdminDictionary }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Catch a mistyped password before it locks the account out.
    if (password !== confirm) {
      setError(t.passwordsMismatch);
      return;
    }
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const json = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok || !json.ok) {
      setError(json.error || t.saveFailed);
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <label className="grid gap-1 text-sm font-bold text-greenGray">
        {t.newPassword}
        <input
          className="focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white px-3"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          minLength={12}
          required
          autoComplete="new-password"
        />
      </label>
      <label className="grid gap-1 text-sm font-bold text-greenGray">
        {t.confirmPassword}
        <input
          className="focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white px-3"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          type="password"
          minLength={12}
          required
          autoComplete="new-password"
        />
      </label>
      <p className="text-xs text-greenGray">{t.passwordPolicy}</p>
      {error ? <p className="rounded-lg bg-coralBase/10 p-3 text-sm text-coralBase">{error}</p> : null}
      <button disabled={loading} className="rounded-full bg-coralBase px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {loading ? "..." : t.save}
      </button>
    </form>
  );
}
