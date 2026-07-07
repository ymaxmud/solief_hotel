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
    const formEl = event.currentTarget;
    setLoading(true);
    setMessage("");
    const form = new FormData(formEl);
    const body = { id, ...Object.fromEntries(form.entries()) };
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        setMessage(json.error || saveFailedLabel);
        return;
      }
      setMessage(savedLabel);
      formEl.reset();
      router.refresh();
    } catch {
      setMessage(saveFailedLabel);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} autoComplete="off" className="grid min-w-44 gap-2">
      {fields.map((field) => (
        <label key={field.name} className="grid gap-1 text-xs font-semibold text-greenGray">
          {field.label}
          {field.options ? (
            <select name={field.name} required={field.required} autoComplete="off" className="focus-ring min-h-9 rounded-md border border-charcoal/15 bg-white px-2">
              {field.options.map((option) => {
                const value = typeof option === "string" ? option : option.value;
                const label = typeof option === "string" ? option : option.label;
                return <option key={value} value={value}>{label}</option>;
              })}
            </select>
          ) : (
            // A PIN is a secret; use new-password so browsers/managers don't autofill or save it.
            <input name={field.name} type={field.type || "text"} required={field.required} autoComplete="new-password" data-lpignore="true" className="focus-ring min-h-9 rounded-md border border-charcoal/15 bg-white px-2" />
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
