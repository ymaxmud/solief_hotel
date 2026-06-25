"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FieldConfig } from "./AdminMutationForm";

export function AdminPatchForm({
  endpoint,
  id,
  fields,
  submitLabel,
  savedLabel,
  saveFailedLabel,
  loadingLabel
}: {
  endpoint: string;
  id: string;
  fields: FieldConfig[];
  submitLabel: string;
  savedLabel: string;
  saveFailedLabel: string;
  loadingLabel: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const body = { id, ...Object.fromEntries(form.entries()) };
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const json = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok || !json.ok) {
      setMessage(json.error || saveFailedLabel);
      return;
    }
    setMessage(savedLabel);
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid min-w-44 gap-2">
      {fields.map((field) => (
        <label key={field.name} className="grid gap-1 text-xs font-semibold text-greenGray">
          {field.label}
          {field.options ? (
            <select name={field.name} required={field.required} className="focus-ring min-h-9 rounded-md border border-charcoal/15 bg-white px-2">
              {field.options.map((option) => {
                const value = typeof option === "string" ? option : option.value;
                const label = typeof option === "string" ? option : option.label;
                return <option key={value} value={value}>{label}</option>;
              })}
            </select>
          ) : (
            <input name={field.name} type={field.type || "text"} required={field.required} className="focus-ring min-h-9 rounded-md border border-charcoal/15 bg-white px-2" />
          )}
        </label>
      ))}
      <button disabled={loading} className="rounded-full bg-greenGray px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">
        {loading ? loadingLabel : submitLabel}
      </button>
      {message ? <p className="text-xs font-bold text-greenGray">{message}</p> : null}
    </form>
  );
}
