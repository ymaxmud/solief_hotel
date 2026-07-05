"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { AdminDictionary } from "@/i18n/admin";

export function StaffAttendanceClient({ labels }: { labels: AdminDictionary }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const purpose = (searchParams.get("purpose") || "check_in") as "check_in" | "check_out";
  const [staffIdentifier, setStaffIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage(labels.geolocationUnavailable);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch("/api/staff/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              purpose,
              staffIdentifier,
              pin,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            })
          });
          const json = await response.json().catch(() => ({}));
          setMessage(json.ok ? `${labels.success}: ${json.status}` : json.error || labels.attendanceFailed);
        } catch {
          setMessage(labels.attendanceFailed);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setMessage(labels.geolocationRequired);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#f7f4ed] px-4 py-10">
      <h1 className="font-display text-4xl">{labels.staffAttendanceTitle}</h1>
      <p className="mt-2 text-sm text-greenGray">{labels.staffAttendanceNote}</p>
      <label className="mt-6 grid gap-1 text-sm font-bold text-greenGray">
        {labels.staffIdentifier}
        <input value={staffIdentifier} onChange={(event) => setStaffIdentifier(event.target.value)} className="focus-ring min-h-12 rounded-lg border border-charcoal/15 bg-white px-3" autoComplete="username" />
      </label>
      <label className="mt-4 grid gap-1 text-sm font-bold text-greenGray">
        {labels.attendancePin}
        <input value={pin} onChange={(event) => setPin(event.target.value)} className="focus-ring min-h-12 rounded-lg border border-charcoal/15 bg-white px-3" type="password" inputMode="numeric" autoComplete="one-time-code" />
      </label>
      <button disabled={loading || !token || !staffIdentifier || !pin} onClick={submit} className="mt-5 w-full rounded-full bg-coralBase px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {loading ? labels.loading : purpose}
      </button>
      {message ? <p className="mt-5 rounded-lg bg-white p-4 text-sm font-bold text-greenGray">{message}</p> : null}
    </div>
  );
}
