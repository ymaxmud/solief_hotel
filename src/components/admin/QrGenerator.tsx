"use client";

import { useEffect, useState } from "react";

// Server tokens live 60s. Regenerate before that so a code shown to staff is
// always still valid when they scan it (the old interval == TTL meant the
// visible code could already be expired / swap mid-scan).
const REGEN_MS = 45_000;

export function QrGenerator({
  generateLabel,
  errorLabel,
  qrAlt,
  expiresLabel,
  loadingLabel,
  purposeLabels
}: {
  generateLabel: string;
  errorLabel: string;
  qrAlt: string;
  expiresLabel: string;
  loadingLabel: string;
  purposeLabels: { check_in: string; check_out: string };
}) {
  const [purpose, setPurpose] = useState<"check_in" | "check_out">("check_in");
  const [qr, setQr] = useState<{ qrDataUrl: string; url: string; expiresAt: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(0);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/attendance/qr-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose })
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        setError(json.error || errorLabel);
        setQr(null); // drop the now-stale code so nobody scans an expired one
        return;
      }
      setQr(json);
    } catch {
      setError(errorLabel);
      setQr(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generate();
    const interval = window.setInterval(generate, REGEN_MS);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purpose]);

  useEffect(() => {
    if (!qr) {
      setSecondsLeft(0);
      return;
    }
    const tick = () => setSecondsLeft(Math.max(0, Math.round((new Date(qr.expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [qr]);

  const expiryTime = qr
    ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(qr.expiresAt))
    : "";

  return (
    <div className="grid gap-4">
      <select value={purpose} onChange={(event) => setPurpose(event.target.value as "check_in" | "check_out")} className="focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white px-3">
        <option value="check_in">{purposeLabels.check_in}</option>
        <option value="check_out">{purposeLabels.check_out}</option>
      </select>
      <button type="button" onClick={generate} className="rounded-full bg-coralBase px-5 py-3 text-sm font-bold text-white">{generateLabel}</button>
      {error ? <p className="text-sm text-coralBase">{error}</p> : null}
      {loading && !qr ? <p className="text-sm text-greenGray">{loadingLabel}…</p> : null}
      {qr ? (
        <div className="rounded-lg bg-white p-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr.qrDataUrl} alt={qrAlt} className="mx-auto h-72 w-72" />
          <p className="mt-3 break-all text-xs text-greenGray">{qr.url}</p>
          <p className="mt-2 text-sm font-bold">{expiresLabel}: {expiryTime} · {secondsLeft}s</p>
        </div>
      ) : null}
    </div>
  );
}
