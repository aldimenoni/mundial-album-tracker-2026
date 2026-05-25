import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { AlbumSpreadProgressDto } from "@mundial-album/shared";
import { getFlagSrc, getTeamTheme } from "@mundial-album/shared";
import { ChevronRight } from "lucide-react";
import { AppCard } from "./ui/AppCard";
import { AnimatedProgress } from "./ui/AnimatedProgress";
import { SectionHeader } from "./ui/Badges";
import { cn } from "../lib/cn";
import { formatCompletionPercentLabel } from "../lib/format-percent";
import { fadeUpItem, staggerContainer } from "../lib/motion-presets";

type SpreadProgressListProps = {
  spreads: AlbumSpreadProgressDto[];
};

const MEDALS = ["🥇", "🥈", "🥉"] as const;

function SpreadRankBadge({ index }: { index: number }) {
  const isTopThree = index < 3;

  return (
    <span
      className={cn(
        "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[0.62rem] font-black leading-none shadow-md",
        isTopThree
          ? "border-panini-gold/50 bg-panini-navy text-panini-gold"
          : "border-white/20 bg-panini-navy/95 text-white/80"
      )}
      aria-label={`Puesto ${index + 1}`}
    >
      {isTopThree ? MEDALS[index] : index + 1}
    </span>
  );
}

export function SpreadProgressList({ spreads }: SpreadProgressListProps) {
  if (spreads.length === 0) {
    return null;
  }

  return (
    <AppCard className="p-0">
      <div className="border-b border-white/10 p-4">
        <SectionHeader
          eyebrow="Ranking"
          title="Cuadros por completar"
          subtitle="Los que están más cerca de cerrarse"
        />
      </div>

      <motion.ol
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid max-h-[28rem] gap-2 overflow-y-auto p-3"
        aria-label="Cuadros por completar"
      >
        {spreads.map((spread, index) => {
          const theme = getTeamTheme(spread.team);
          const flagSrc = theme ? getFlagSrc(theme.flagCode) : null;

          return (
            <motion.li key={spread.spreadId} variants={fadeUpItem}>
              <article
                className={cn(
                  "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-white/12 bg-white/8 p-3 backdrop-blur-md",
                  spread.missing === 1 && "border-emerald-400/30 shadow-[0_0_24px_rgba(16,185,129,0.12)]"
                )}
              >
                <div className="relative shrink-0">
                  {flagSrc ? (
                    <img
                      className="h-12 w-12 rounded-full border-2 border-white/25 object-cover shadow-md"
                      src={flagSrc}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    />
                  ) : (
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-sm font-black text-white/70">
                      {spread.label.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <SpreadRankBadge index={index} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-black text-white">
                        {spread.label}
                      </strong>
                      {spread.subtitle ? (
                        <span className="block truncate text-xs font-semibold text-white/55">
                          {spread.subtitle}
                        </span>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-sm font-black tabular-nums text-panini-gold">
                      {formatCompletionPercentLabel(spread.completionPercentage)}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <AnimatedProgress value={spread.completionPercentage} />
                    <p
                      className={cn(
                        "mt-1.5 text-[0.68rem] font-extrabold uppercase tracking-wide",
                        spread.missing === 1 ? "text-emerald-300" : "text-rose-200"
                      )}
                    >
                      {spread.missing === 1
                        ? "¡Solo te falta 1!"
                        : `${spread.missing} faltantes`}
                    </p>
                  </div>
                </div>

                <Link
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl border border-white/15 bg-white/10 text-white"
                  to={`/mi-album?cuadro=${encodeURIComponent(spread.team)}`}
                  aria-label={`Ver ${spread.label} en el álbum`}
                  title={`Ver ${spread.label} en el álbum`}
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </article>
            </motion.li>
          );
        })}
      </motion.ol>
    </AppCard>
  );
}
