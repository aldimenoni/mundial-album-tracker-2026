import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { springSnappy } from "../../lib/motion-presets";

type NavItem = {
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

type FloatingBottomNavProps = {
  items: NavItem[];
};

export function FloatingBottomNav({ items }: FloatingBottomNavProps) {
  const location = useLocation();

  return (
    <nav
      aria-label="Navegacion principal"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] bg-gradient-to-t from-panini-navy via-panini-navy/95 to-transparent"
      />
      <div className="relative px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-2">
        <div className="pointer-events-auto mx-auto max-w-md rounded-[1.75rem] border border-white/15 bg-panini-navy/90 p-2 shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="relative grid grid-flow-col auto-cols-fr gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[0.62rem] font-extrabold uppercase tracking-wide text-white/55"
              >
                {isActive ? (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    transition={springSnappy}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/18 to-white/6 shadow-inner"
                  />
                ) : null}
                <motion.span
                  animate={{ scale: isActive ? 1.12 : 1, y: isActive ? -1 : 0 }}
                  transition={springSnappy}
                  className={cn("relative z-10", isActive && "text-panini-gold")}
                >
                  <Icon size={22} aria-hidden="true" />
                </motion.span>
                <span className={cn("relative z-10 truncate", isActive && "text-white")}>
                  {item.shortLabel}
                </span>
              </NavLink>
            );
          })}
        </div>
        </div>
      </div>
    </nav>
  );
}
