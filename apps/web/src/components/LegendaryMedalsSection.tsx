import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { LegendaryPlayerMedalDto } from "@mundial-album/shared";
import { getFlagSrc, getTeamTheme } from "@mundial-album/shared";
import { Lock, Sparkles, Star } from "lucide-react";

type LegendaryMedalsSectionProps = {
  medals: LegendaryPlayerMedalDto[];
};

function sortMedalsEarnedFirst(medals: LegendaryPlayerMedalDto[]): LegendaryPlayerMedalDto[] {
  return medals
    .map((medal, index) => ({ medal, index }))
    .sort((left, right) => {
      if (left.medal.earned !== right.medal.earned) {
        return left.medal.earned ? -1 : 1;
      }

      return left.index - right.index;
    })
    .map(({ medal }) => medal);
}

function getStickerCountryCode(stickerCode: string): string {
  const match = stickerCode.match(/^([A-Z]+)/);
  return match?.[1] ?? stickerCode.slice(0, 3);
}

function getMedalStatusLabel(medal: LegendaryPlayerMedalDto): string {
  if (!medal.earned) {
    return "Todavía falta pegarla";
  }

  if (medal.repeated) {
    return "¡La tenés repetida!";
  }

  return "¡Figurita en el álbum!";
}

export function LegendaryMedalsSection({ medals }: LegendaryMedalsSectionProps) {
  const sortedMedals = useMemo(() => sortMedalsEarnedFirst(medals), [medals]);
  const earnedCount = sortedMedals.filter((medal) => medal.earned).length;
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    carouselRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [sortedMedals]);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    function handleScroll(): void {
      if (!carousel) {
        return;
      }

      const slides = carousel.querySelectorAll<HTMLElement>(".legendary-medal");

      if (!slides.length) {
        return;
      }

      const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
        const distance = Math.abs(slideCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    }

    carousel.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
    };
  }, [sortedMedals.length]);

  return (
    <section className="summary-panel legendary-medals-panel" aria-label="Jugadores estrella conseguidos">
      <div className="legendary-medals-glow" aria-hidden="true" />

      <div className="summary-section-header legendary-medals-header">
        <div>
          <p className="eyebrow legendary-medals-eyebrow">
            <Sparkles size={13} aria-hidden="true" />
            Colección especial
          </p>
          <h3>Jugadores estrella</h3>
          <p className="legendary-medals-hint">Deslizá para ver tu colección</p>
        </div>
        <span className="legendary-medals-counter">
          <strong>{earnedCount}</strong>
          <span>/ {sortedMedals.length}</span>
        </span>
      </div>

      <div ref={carouselRef} className="legendary-medals-carousel">
        {sortedMedals.map((medal) => {
          const theme = getTeamTheme(medal.team) ?? {
            flagCode: "xx",
            primary: "#0b1f4b",
            secondary: "#003087",
            accent: "#00a651"
          };
          const flagSrc = getFlagSrc(theme.flagCode);
          const countryCode = getStickerCountryCode(medal.stickerCode);
          const cardClassName = medal.earned
            ? medal.repeated
              ? "legendary-medal is-earned is-repeated"
              : "legendary-medal is-earned"
            : "legendary-medal is-locked";

          return (
            <article
              key={medal.id}
              className={cardClassName}
              style={
                {
                  "--medal-primary": theme.primary,
                  "--medal-secondary": theme.secondary,
                  "--medal-accent": theme.accent
                } as CSSProperties
              }
            >
              <div className="legendary-panini-sticker">
                <div className="legendary-panini-art">
                  <span className="legendary-panini-bg-num legendary-panini-bg-num-left" aria-hidden="true">
                    2
                  </span>
                  <span className="legendary-panini-bg-num legendary-panini-bg-num-right" aria-hidden="true">
                    6
                  </span>

                  <img
                    className="legendary-panini-player"
                    src={medal.portraitSrc}
                    alt={medal.name}
                    loading="lazy"
                  />

                  <div className="legendary-panini-edge" aria-hidden="true">
                    <img className="legendary-panini-edge-flag" src={flagSrc} alt="" />
                    <span className="legendary-panini-edge-code">{countryCode}</span>
                  </div>

                  <span className="legendary-panini-fifa" aria-hidden="true">
                    FIFA
                  </span>

                  {!medal.earned ? (
                    <div className="legendary-panini-lock-overlay">
                      <Lock size={22} aria-hidden="true" />
                    </div>
                  ) : null}
                </div>

                <div className="legendary-panini-footer">
                  <div className="legendary-panini-nameplate">
                    <strong>{medal.shortName.toUpperCase()}</strong>
                    <span>{medal.stickerCode}</span>
                  </div>
                  <div className="legendary-panini-team-bar">
                    <span>{medal.team.toUpperCase()}</span>
                    <span className="legendary-panini-brand" aria-hidden="true">
                      panini
                    </span>
                  </div>
                </div>
              </div>

              <p className={medal.earned ? "legendary-medal-status is-earned" : "legendary-medal-status"}>
                {getMedalStatusLabel(medal)}
              </p>

              {medal.repeated ? (
                <span className="legendary-medal-repeated">
                  <Star size={14} aria-hidden="true" />
                  Repetida
                </span>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="legendary-medals-pagination" aria-hidden="true">
        {sortedMedals.map((medal, index) => (
          <span
            key={medal.id}
            className={
              index === activeIndex
                ? medal.earned
                  ? "legendary-medals-dot is-active is-earned"
                  : "legendary-medals-dot is-active"
                : medal.earned
                  ? "legendary-medals-dot is-earned"
                  : "legendary-medals-dot"
            }
          />
        ))}
      </div>
    </section>
  );
}
