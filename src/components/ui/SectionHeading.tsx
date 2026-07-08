import type { ReactNode } from "react";
import { Ornament } from "./Ornament";

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="relative mx-auto mb-10 max-w-3xl text-center">
      <Ornament className="absolute left-1/2 top-0 -z-10 h-24 w-64 -translate-x-1/2 opacity-20" />
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-champagne">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl leading-tight text-ink md:text-5xl">{title}</h2>
      {children ? <div className="mt-4 text-base leading-7 text-slate md:text-lg">{children}</div> : null}
    </div>
  );
}
