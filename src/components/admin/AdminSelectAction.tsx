"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminSelectAction({
  endpoint,
  method = "PATCH",
  id,
  field,
  options,
  placeholder,
  buttonLabel,
  confirm
}: {
  endpoint: string;
  method?: "POST" | "PATCH";
  id?: string;
  field: string;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  buttonLabel: string;
  confirm?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!value) return;
    if (confirm && !window.confirm(confirm)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(id ? { id } : {}), [field]: value })
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        setError(json.error || "Action failed");
        return;
      }
      setValue("");
      router.refresh();
    } catch {
      setError("Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="grid min-w-40 gap-1">
      <select value={value} onChange={(event) => setValue(event.target.value)} className="focus-ring min-h-9 rounded-md border border-charcoal/15 bg-white px-2 text-xs">
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <button type="button" disabled={loading || !value} onClick={submit} className="rounded-full bg-greenGray px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">
        {loading ? "..." : buttonLabel}
      </button>
      {error ? <span className="text-xs font-semibold text-coralBase">{error}</span> : null}
    </span>
  );
}
