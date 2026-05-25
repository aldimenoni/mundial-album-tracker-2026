import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { getUserAvatarGradient, getUserInitials } from "../../lib/user-visuals";

type UserAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-10 w-10 text-xs",
  md: "h-14 w-14 text-sm",
  lg: "h-20 w-20 text-lg"
};

export function UserAvatar({ name, size = "md", className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-gradient-to-br font-black leading-none text-white shadow-lg",
        getUserAvatarGradient(name),
        sizeMap[size],
        className
      )}
      aria-hidden="true"
    >
      {getUserInitials(name)}
    </div>
  );
}

type HolographicBadgeProps = {
  children: ReactNode;
  tone?: "gold" | "emerald" | "rare" | "legendary";
  className?: string;
};

const toneClasses = {
  gold: "from-panini-gold/30 to-amber-300/10 text-panini-gold border-panini-gold/40",
  emerald: "from-emerald-400/25 to-emerald-300/10 text-emerald-200 border-emerald-300/35",
  rare: "from-sky-400/25 to-indigo-300/10 text-sky-200 border-sky-300/35",
  legendary: "holo-border text-panini-gold"
};

export function HolographicBadge({
  children,
  tone = "gold",
  className
}: HolographicBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border bg-gradient-to-r px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action
}: {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-panini-gold">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm font-medium text-white/65">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-white/20 bg-white/5 px-5 py-8 text-center backdrop-blur-md">
      {icon ? <div className="mb-3 flex justify-center text-panini-gold">{icon}</div> : null}
      <h3 className="text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm font-medium text-white/65">{description}</p>
    </div>
  );
}

export function AlertBanner({
  children,
  tone = "error"
}: {
  children: ReactNode;
  tone?: "error" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-bold",
        tone === "error"
          ? "border-rose-300/30 bg-rose-500/15 text-rose-100"
          : "border-emerald-300/30 bg-emerald-500/15 text-emerald-100"
      )}
    >
      {children}
    </div>
  );
}
