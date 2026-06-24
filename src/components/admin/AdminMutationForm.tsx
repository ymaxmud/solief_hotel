"use client";

import { useState } from "react";

export type FieldConfig = {
  name: string;
  label: string;
  type?: string;
  options?: string[];
  required?: boolean;
};

export function AdminMutationForm({
  endpoint,
  fields,
  submitLabel,
  savedLabel,
  saveFailedLabel,
  loadingLabel
}: {
  endpoint: string;
  fields: FieldConfig[];
  submitLabel: string;
  savedLabel: string;
  saveFailedLabel: string;
  loadingLabel: string;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok || !json.ok) {
      setMessage(json.error || saveFailedLabel);
      return;
    }
    setMessage(savedLabel);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
      {fields.map((field) => (
        <label key={field.name} className="grid gap-1 text-sm font-semibold text-greenGray">
          {field.label}
          {field.options ? (
            <select name={field.name} required={field.required} className="focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white px-3">
              {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : (
            <input name={field.name} type={field.type || "text"} required={field.required} className="focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white px-3" />
          )}
        </label>
      ))}
      <div className="md:col-span-2">
        <button disabled={loading} className="rounded-full bg-coralBase px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
          {loading ? loadingLabel : submitLabel}
        </button>
        {message ? <p className="mt-3 text-sm font-bold text-greenGray">{message}</p> : null}
      </div>
    </form>
  );
}
