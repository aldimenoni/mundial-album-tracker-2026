import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type GradientButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "gold" | "ghost" | "danger";
  size?: "md" | "lg";
};

const variantClasses = {
  primary: "bg-gradient-to-r from-panini-royal to-indigo-600 text-white shadow-lg shadow-indigo-900/30",
  gold: "bg-gradient-to-r from-panini-gold to-amber-400 text-panini-navy shadow-lg shadow-amber-500/25",
  ghost: "border border-white/20 bg-white/10 text-white",
  danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white"
};

const sizeClasses = {
  md: "min-h-12 px-4 py-3 text-sm",
  lg: "min-h-14 px-5 py-3.5 text-base"
};

const motionClasses =
  "transition-transform duration-150 active:scale-[0.97] enabled:hover:scale-[1.02] disabled:opacity-60";

export function GradientButton({
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: GradientButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-2xl font-extrabold uppercase tracking-wide",
        motionClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-4 font-bold text-white backdrop-blur-md transition-transform active:scale-[0.97]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-md transition-transform active:scale-[0.94]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
