import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found — Solief Hotel",
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="font-display text-7xl font-bold text-oxford sm:text-8xl">404</p>
      <h1 className="font-display text-2xl font-semibold text-navy sm:text-3xl">This page could not be found</h1>
      <p className="max-w-md text-charcoal/70">
        The page you are looking for may have moved or no longer exists. Let&rsquo;s get you back to Solief Hotel.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/" variant="primary">Back to home</ButtonLink>
        <ButtonLink href="/#contact" variant="light">Contact the hotel</ButtonLink>
      </div>
    </main>
  );
}
