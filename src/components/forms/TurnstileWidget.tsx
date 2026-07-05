"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

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

  // Render as soon as both the script and the container are ready. Called from
  // both the Script onReady handler and the effect, so ordering (mount before or
  // after the script loads) never leaves the widget unrendered — which would
  // otherwise block every booking when Turnstile is enabled server-side.
  const renderWidget = useCallback(() => {
    if (!siteKey || !ref.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: onToken,
      "error-callback": () => onToken(""),
      "expired-callback": () => onToken("")
    });
  }, [siteKey, onToken]);

  useEffect(() => {
    renderWidget();
  }, [renderWidget]);

  if (!siteKey) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
        onLoad={renderWidget}
      />
      <div ref={ref} className="min-h-[65px]" />
    </>
  );
}
