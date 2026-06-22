import { cn } from "@/lib/utils";

export function Ornament({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "ornament-bg rounded-full [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]",
        className
      )}
    />
  );
}
