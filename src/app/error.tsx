"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the error to server logs / monitoring (Sentry can hook here later).
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="font-display text-6xl font-bold text-oxford">Oops</p>
      <h1 className="font-display text-2xl font-semibold text-navy sm:text-3xl">Something went wrong</h1>
      <p className="max-w-md text-charcoal/70">
        An unexpected error occurred while loading this page. You can try again, or return to the homepage.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="light">Back to home</ButtonLink>
      </div>
    </main>
  );
}
