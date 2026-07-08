import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border border-charcoal/10 bg-mist/80 px-3 py-1 text-xs font-semibold text-slate", className)}
      {...props}
    />
  );
}
