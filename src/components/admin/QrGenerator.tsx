"use client";

import { useEffect, useState } from "react";

export function QrGenerator({
  generateLabel,
  errorLabel,
  qrAlt,
  expiresLabel
}: {
  generateLabel: string;
  errorLabel: string;
  qrAlt: string;
  expiresLabel: string;
}) {
  const [purpose, setPurpose] = useState<"check_in" | "check_out">("check_in");
  const [qr, setQr] = useState<{ qrDataUrl: string; url: string; expiresAt: string } | null>(null);
  const [error, setError] = useState("");

  async function generate() {
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
        return;
      }
      setQr(json);
    } catch {
      setError(errorLabel);
    }
  }

  useEffect(() => {
    generate();
    const interval = window.setInterval(generate, 60_000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purpose]);

  return (
    <div className="grid gap-4">
      <select value={purpose} onChange={(event) => setPurpose(event.target.value as "check_in" | "check_out")} className="focus-ring min-h-11 rounded-lg border border-charcoal/15 bg-white px-3">
        <option value="check_in">check_in</option>
        <option value="check_out">check_out</option>
      </select>
      <button type="button" onClick={generate} className="rounded-full bg-coralBase px-5 py-3 text-sm font-bold text-white">{generateLabel}</button>
      {error ? <p className="text-sm text-coralBase">{error}</p> : null}
      {qr ? (
        <div className="rounded-lg bg-white p-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr.qrDataUrl} alt={qrAlt} className="mx-auto h-72 w-72" />
          <p className="mt-3 break-all text-xs text-greenGray">{qr.url}</p>
          <p className="mt-2 text-sm font-bold">{expiresLabel}: {new Date(qr.expiresAt).toLocaleTimeString()}</p>
        </div>
      ) : null}
    </div>
  );
}
