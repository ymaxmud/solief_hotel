import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "light";

const variants: Record<Variant, string> = {
  primary: "bg-oxford text-white shadow-soft hover:bg-navy",
  secondary: "bg-navy text-white shadow-soft hover:bg-slate",
  ghost: "border border-white/35 bg-white/10 text-white backdrop-blur hover:bg-white/20",
  light: "border border-ink/15 bg-white/80 text-ink backdrop-blur hover:bg-white"
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }>(function Button({
  className,
  variant = "primary",
  children,
  ...props
}, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export function ButtonLink({
  className,
  variant = "primary",
  children,
  rel,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; children: ReactNode }) {
  // Ensure links opening a new tab can't reach window.opener.
  const safeRel = props.target === "_blank" ? rel ?? "noopener noreferrer" : rel;
  return (
    <a
      rel={safeRel}
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
