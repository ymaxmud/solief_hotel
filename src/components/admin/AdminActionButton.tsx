"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminActionButton({
  endpoint,
  method = "PATCH",
  body,
  label,
  confirm,
  className = "rounded-full bg-coralBase px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
}: {
  endpoint: string;
  method?: "POST" | "PATCH";
  body: Record<string, unknown>;
  label: string;
  confirm?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        setError(json.error || "Action failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-grid gap-1">
      <button type="button" onClick={run} disabled={loading} className={className}>
        {loading ? "..." : label}
      </button>
      {error ? <span className="text-xs font-semibold text-coralBase">{error}</span> : null}
    </span>
  );
}
