import type { CSSProperties } from "react";
import type { SpreadVisualTheme } from "@mundial-album/shared";
import { getFlagSrc } from "@mundial-album/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SpreadHeroProps = {
  theme: SpreadVisualTheme;
  title: string;
  subtitle?: string;
  groupLabel?: string | undefined;
  pageLabel?: string;
  owned: number;
  total: number;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
};

export function SpreadHero({
  theme,
  title,
  subtitle,
  groupLabel,
  pageLabel,
  owned,
  total,
  canGoPrevious = false,
  canGoNext = false,
  onPrevious,
  onNext
}: SpreadHeroProps) {
  const badgeSrc = theme.flagCode ? getFlagSrc(theme.flagCode) : theme.badgeSrc;
  const showNavigation = Boolean(onPrevious || onNext);

  return (
    <div
      className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 px-3 py-4 text-white"
      style={
        {
          "--spread-primary": theme.primary,
          "--spread-secondary": theme.secondary,
          "--spread-accent": theme.accent,
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
        } as CSSProperties
      }
    >
      {showNavigation ? (
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white disabled:opacity-35"
          type="button"
          aria-label="Cuadro anterior"
          disabled={!canGoPrevious}
          onClick={onPrevious}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      ) : (
        <span aria-hidden="true" className="h-10 w-10" />
      )}

      <div className="min-w-0 text-center">
        {groupLabel ? (
          <p className="truncate text-[0.65rem] font-bold uppercase tracking-wide text-white/85">
            {groupLabel}
          </p>
        ) : null}
        {pageLabel ? (
          <p className="truncate text-[0.65rem] font-bold uppercase tracking-wide text-white/70">
            {pageLabel}
          </p>
        ) : null}

        <div className="mt-1 flex items-center justify-center gap-2">
          {badgeSrc ? (
            <img
              className="h-8 w-8 shrink-0 rounded-full border-2 border-white/40 object-cover"
              src={badgeSrc}
              alt=""
              loading="lazy"
            />
          ) : null}
          <div className="min-w-0">
            <h2 className="truncate text-base font-black">{title}</h2>
            {subtitle ? (
              <p className="truncate text-[0.65rem] font-semibold uppercase text-white/75">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <p className="mt-2 text-sm font-black tabular-nums">
          <span className="rounded-full bg-black/25 px-3 py-1">
            {owned}/{total}
          </span>
        </p>
      </div>

      {showNavigation ? (
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white disabled:opacity-35"
          type="button"
          aria-label="Cuadro siguiente"
          disabled={!canGoNext}
          onClick={onNext}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      ) : (
        <span aria-hidden="true" className="h-10 w-10" />
      )}
    </div>
  );
}
