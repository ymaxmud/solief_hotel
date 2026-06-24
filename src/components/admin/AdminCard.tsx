import type { ReactNode } from "react";

export function AdminCard({ title, value, children }: { title: string; value?: string | number; children?: ReactNode }) {
  return (
    <section className="rounded-lg border border-charcoal/10 bg-white/85 p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-greenGray">{title}</p>
      {value !== undefined ? <p className="mt-3 font-display text-4xl text-charcoal">{value}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
