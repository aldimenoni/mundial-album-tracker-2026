import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { tapScale } from "../../lib/motion-presets";

type AppCardProps = {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
};

export function AppCard({ children, className, glow = false, onClick }: AppCardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      {...(onClick ? { type: "button" as const, onClick } : {})}
      {...tapScale}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] border border-white/15 bg-white/12 p-4 text-left shadow-[var(--shadow-soft)] backdrop-blur-xl",
        glow && "shadow-[var(--shadow-glow)]",
        onClick && "w-full",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      {children}
    </Component>
  );
}

export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-white/12 bg-white/8 p-4 backdrop-blur-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}
