import { cn } from "@/lib/utils";

/**
 * Text-based Solief Hotel wordmark — a refined serif treatment (no icon).
 * Works on light and navy backgrounds via the `tone` prop. Font size is
 * controlled by the parent through `className` (e.g. `text-2xl`).
 */
export function Wordmark({
  tone = "light",
  sub = false,
  className
}: {
  tone?: "light" | "dark";
  sub?: boolean;
  className?: string;
}) {
  const name = tone === "dark" ? "text-ink" : "text-white";
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className={cn("font-display font-medium tracking-[0.015em]", name)}>Solief Hotel</span>
      {sub ? (
        <span className="mt-1.5 text-[0.58em] font-semibold uppercase tracking-[0.42em] text-champagne">
          Boutique · Tashkent
        </span>
      ) : null}
    </span>
  );
}
