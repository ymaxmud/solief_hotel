"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type FieldConfig = {
  name: string;
  label: string;
  type?: string;
  options?: Array<string | { value: string; label: string }>;
  required?: boolean;
  placeholder?: string;
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
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    setLoading(true);
    setMessage("");
    const form = new FormData(formEl);
    // Drop empty values so unselected optional fields (e.g. an optional room
    // picker showing the "—" placeholder) are omitted rather than sent as ""
    // — an empty string fails server-side UUID/enum validation. Required fields
    // are enforced by the browser before submit, so they are never empty here.
    const body = Object.fromEntries([...form.entries()].filter(([, value]) => value !== ""));
    try {
      const response = await fetch(endpoint, {
        method: "POST",
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
    // autoComplete off: this is a CRM form where staff enter OTHER people's
    // details (guests, staff), so browser autofill of the operator's own saved
    // name/phone/email must not pollute the records.
    <form onSubmit={submit} autoComplete="off" className="grid gap-3 md:grid-cols-2">
      {fields.map((field) => (
        <label key={field.name} className="grid gap-1 text-sm font-semibold text-greenGray">
          {field.label}
          {field.options ? (
            <select
              name={field.name}
              required={field.required}
              defaultValue=""
              autoComplete="off"
              className="focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white px-3"
            >
              <option value="" disabled={field.required}>
                {field.placeholder ?? "—"}
              </option>
              {field.options.map((option) => {
                const value = typeof option === "string" ? option : option.value;
                const label = typeof option === "string" ? option : option.label;
                return <option key={value} value={value}>{label}</option>;
              })}
            </select>
          ) : (
            // A random, unrecognized token reliably suppresses Chrome autofill,
            // which ignores autoComplete="off" for known fields like phone/email.
            <input name={field.name} type={field.type || "text"} required={field.required} autoComplete={`off-${field.name}`} data-lpignore="true" className="focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white px-3" />
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
