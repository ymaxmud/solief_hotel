import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GlassPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-white/30 bg-white/18 shadow-glow backdrop-blur-xl", className)}
      {...props}
    />
  );
}
