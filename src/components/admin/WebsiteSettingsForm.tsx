"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type SettingsField = {
  name: string;
  label: string;
  type?: "text" | "number" | "time" | "email" | "url" | "textarea";
  defaultValue?: string | number | null;
  hint?: string;
  step?: string;
  min?: number;
  max?: number;
  required?: boolean;
};

/**
 * A settings form that shows the values currently in use and PATCHes only what
 * changed. Unlike the create/patch forms elsewhere in the CRM, it does not reset
 * after saving: the owner needs to keep seeing what is live.
 */
export function WebsiteSettingsForm({
  endpoint,
  payload,
  fields,
  submitLabel,
  savedLabel,
  saveFailedLabel,
  loadingLabel,
  columns = 2
}: {
  endpoint: string;
  /** Identity fields merged into every request, e.g. { id, kind }. */
  payload: Record<string, string>;
  fields: SettingsField[];
  submitLabel: string;
  savedLabel: string;
  saveFailedLabel: string;
  loadingLabel: string;
  columns?: 1 | 2;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);
    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = { ...payload };
    for (const [key, value] of form.entries()) {
      // An untouched optional field submits as "" — sending it would blank the
      // stored value, so empty strings are only forwarded for fields that are
      // genuinely clearable (links), which the API maps to null.
      body[key] = value;
    }
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        setIsError(true);
        setMessage(json.error || saveFailedLabel);
        return;
      }
      setMessage(savedLabel);
      router.refresh();
    } catch {
      setIsError(true);
      setMessage(saveFailedLabel);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "focus-ring min-h-10 w-full rounded-md border border-charcoal/15 bg-white px-2 text-sm text-charcoal";

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className={columns === 2 ? "grid gap-4 md:grid-cols-2" : "grid gap-4"}>
        {fields.map((field) => {
          const id = `${payload.id || "settings"}-${field.name}`;
          const describedBy = field.hint ? `${id}-hint` : undefined;
          return (
            <div key={field.name} className="grid min-w-0 gap-1">
              <label htmlFor={id} className="text-xs font-semibold text-greenGray">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={id}
                  name={field.name}
                  defaultValue={field.defaultValue ?? ""}
                  aria-describedby={describedBy}
                  rows={3}
                  className={`${inputClass} py-2`}
                />
              ) : (
                <input
                  id={id}
                  name={field.name}
                  type={field.type || "text"}
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  required={field.required}
                  defaultValue={field.defaultValue ?? ""}
                  aria-describedby={describedBy}
                  className={inputClass}
                />
              )}
              {field.hint ? (
                <p id={describedBy} className="text-[11px] leading-4 text-charcoal/55">
                  {field.hint}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={loading}
          className="rounded-full bg-greenGray px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          {loading ? loadingLabel : submitLabel}
        </button>
        {message ? (
          <p role="status" className={`text-xs font-bold ${isError ? "text-coralBase" : "text-greenGray"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
