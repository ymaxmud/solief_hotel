"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "error-callback": () => void; "expired-callback": () => void }) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({ siteKey, onToken }: { siteKey?: string; onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!siteKey || !ref.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: onToken,
      "error-callback": () => onToken(""),
      "expired-callback": () => onToken("")
    });
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      <div ref={ref} className="min-h-[65px]" />
    </>
  );
}
