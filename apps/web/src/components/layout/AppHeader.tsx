import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "../../state/user-store";
import { IconButton } from "../ui/GradientButton";
import { UserAvatar } from "../ui/Badges";

type AppHeaderProps = {
  onSignOut?: () => void;
};

export function AppHeader({ onSignOut }: AppHeaderProps) {
  const { currentUser } = useUser();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-panini-navy/90 backdrop-blur-2xl">
      <div className="h-[env(safe-area-inset-top,0px)] bg-panini-navy" />
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <motion.img
            initial={{ rotate: -8, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            src="/brand/world-cup-2026.svg"
            alt="Copa del Mundo FIFA"
            className="h-10 w-10 rounded-xl border-2 border-panini-gold/70 bg-white p-1 shadow-lg"
          />
          <div className="min-w-0">
            <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.16em] text-white/70">
              FIFA World Cup 2026
            </p>
            <h1 className="truncate text-base font-black uppercase tracking-wide text-white">
              Album Tracker
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {currentUser ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2 py-1 sm:flex">
                <UserAvatar name={currentUser.name} size="sm" />
                <span className="max-w-[18vw] truncate text-xs font-bold text-white">
                  @{currentUser.name}
                </span>
              </div>
              {onSignOut ? (
                <IconButton type="button" aria-label="Salir" title="Salir" onClick={onSignOut}>
                  <LogOut size={18} />
                </IconButton>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
