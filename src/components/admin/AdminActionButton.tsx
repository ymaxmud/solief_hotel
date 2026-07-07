"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminActionButton({
  endpoint,
  method = "PATCH",
  body,
  label,
  confirm,
  resultField,
  resultLabel,
  className = "rounded-full bg-coralBase px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
}: {
  endpoint: string;
  method?: "POST" | "PATCH";
  body: Record<string, unknown>;
  label: string;
  confirm?: string;
  /** If set, a value returned under this key is shown once instead of refreshing. */
  resultField?: string;
  resultLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

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
      if (resultField && json[resultField]) {
        // Show the one-time value (e.g. a temp password) and skip the refresh,
        // which would unmount this component and lose it.
        setResult(String(json[resultField]));
      } else {
        router.refresh();
      }
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
      {result ? (
        <span className="rounded-lg bg-hotelBlue/10 p-2 text-xs text-greenGray">
          {resultLabel}
          <br />
          <code className="select-all font-bold text-charcoal">{result}</code>
        </span>
      ) : null}
    </span>
  );
}
