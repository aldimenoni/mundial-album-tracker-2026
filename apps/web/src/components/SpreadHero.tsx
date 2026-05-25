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
      className="spread-hero"
      style={
        {
          "--spread-primary": theme.primary,
          "--spread-secondary": theme.secondary,
          "--spread-accent": theme.accent
        } as CSSProperties
      }
    >
      {showNavigation ? (
        <button
          className="spread-hero-nav"
          type="button"
          aria-label="Cuadro anterior"
          disabled={!canGoPrevious}
          onClick={onPrevious}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      ) : (
        <div className="spread-hero-nav-spacer" aria-hidden="true" />
      )}

      <div className="spread-hero-center">
        {groupLabel ? <p className="spread-hero-group">{groupLabel}</p> : null}
        {pageLabel ? <p className="spread-hero-page">{pageLabel}</p> : null}

        <div className="spread-hero-title-row">
          {badgeSrc ? (
            <div className="spread-hero-badge-wrap">
              <img className="spread-hero-badge" src={badgeSrc} alt="" loading="lazy" />
            </div>
          ) : null}
          <div className="spread-hero-title-copy">
            <h2>{title}</h2>
            {subtitle ? <p className="spread-hero-subtitle">{subtitle}</p> : null}
          </div>
        </div>

        <p className="spread-hero-progress">
          <strong>
            {owned}/{total}
          </strong>
        </p>
      </div>

      {showNavigation ? (
        <button
          className="spread-hero-nav"
          type="button"
          aria-label="Cuadro siguiente"
          disabled={!canGoNext}
          onClick={onNext}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      ) : (
        <div className="spread-hero-nav-spacer" aria-hidden="true" />
      )}
    </div>
  );
}
