import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-charcoal/10 bg-white/75 shadow-soft backdrop-blur", className)}
      {...props}
    />
  );
}
