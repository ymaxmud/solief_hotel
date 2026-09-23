"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Switch a catalogue amenity on or off for the public site.
 *
 * The catalogue itself is defined in code (src/content/amenities.ts) so the
 * owner never has to supply an icon name or markup — only availability.
 */
export function AmenityToggle({
  amenityKey,
  label,
  isActive,
  savedLabel,
  saveFailedLabel
}: {
  amenityKey: string;
  label: string;
  isActive: boolean;
  savedLabel: string;
  saveFailedLabel: string;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(isActive);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function toggle(next: boolean) {
    setPending(true);
    setMessage("");
    // Show the new state immediately, then roll back if the save is rejected.
    setChecked(next);
    try {
      const response = await fetch("/api/admin/website", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "amenity", amenityKey, isActive: next })
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        setChecked(!next);
        setMessage(json.error || saveFailedLabel);
        return;
      }
      setMessage(savedLabel);
      router.refresh();
    } catch {
      setChecked(!next);
      setMessage(saveFailedLabel);
    } finally {
      setPending(false);
    }
  }

  return (
    <label className="flex items-center gap-3 rounded-lg border border-charcoal/10 bg-white px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(event) => toggle(event.target.checked)}
        className="focus-ring h-4 w-4"
      />
      <span className="font-semibold text-charcoal">{label}</span>
      {message ? <span className="ml-auto text-[11px] text-greenGray">{message}</span> : null}
    </label>
  );
}
