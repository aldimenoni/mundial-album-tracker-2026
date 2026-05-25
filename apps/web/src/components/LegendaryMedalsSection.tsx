import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import type { LegendaryPlayerMedalDto } from "@mundial-album/shared";
import { getFlagSrc, getTeamTheme } from "@mundial-album/shared";
import { Lock, Sparkles, Star } from "lucide-react";
import { AppCard } from "./ui/AppCard";
import { SectionHeader } from "./ui/Badges";
import { cn } from "../lib/cn";

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

      const slides = carousel.querySelectorAll<HTMLElement>("[data-medal-slide]");

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
    <AppCard glow className="spotlight overflow-hidden p-0" aria-label="Jugadores estrella conseguidos">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <SectionHeader
            eyebrow={
              <span className="inline-flex items-center gap-1">
                <Sparkles size={13} aria-hidden="true" />
                Colección especial
              </span>
            }
            title="Jugadores estrella"
            subtitle="Deslizá para ver tu colección holográfica"
          />
          <span className="inline-flex h-10 shrink-0 items-center justify-center gap-0.5 rounded-full border border-panini-gold/35 bg-panini-gold/15 px-2.5 text-[0.7rem] font-extrabold leading-none tabular-nums">
            <span className="text-panini-gold">{earnedCount}</span>
            <span className="text-white/50">/</span>
            <span className="text-white/70">{sortedMedals.length}</span>
          </span>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sortedMedals.map((medal, index) => {
          const theme = getTeamTheme(medal.team) ?? {
            flagCode: "xx",
            primary: "#0b1f4b",
            secondary: "#003087",
            accent: "#00a651"
          };
          const flagSrc = getFlagSrc(theme.flagCode);
          const countryCode = getStickerCountryCode(medal.stickerCode);
          const isActive = index === activeIndex;

          return (
            <motion.article
              key={medal.id}
              data-medal-slide
              animate={{
                scale: isActive ? 1 : 0.94,
                opacity: isActive ? 1 : 0.72
              }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="grid w-[min(100%,15.5rem)] shrink-0 snap-center justify-items-center gap-3"
            >
              <div
                className={cn(
                  "legendary-panini-sticker transition-shadow duration-300",
                  medal.earned && !medal.repeated && "shadow-[0_16px_40px_rgba(16,185,129,0.25)]",
                  medal.repeated && "holo-border shadow-[0_16px_40px_rgba(246,196,83,0.25)]",
                  !medal.earned && "opacity-90"
                )}
                style={
                  {
                    "--medal-primary": theme.primary,
                    "--medal-secondary": theme.secondary,
                    "--medal-accent": theme.accent
                  } as CSSProperties
                }
              >
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

                  {medal.earned ? <span className="legendary-panini-shine" aria-hidden="true" /> : null}
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

              <p
                className={cn(
                  "text-center text-sm font-extrabold",
                  medal.earned ? "text-emerald-300" : "text-white/55"
                )}
              >
                {getMedalStatusLabel(medal)}
              </p>

              {medal.repeated ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/35 bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-100">
                  <Star size={14} aria-hidden="true" />
                  Repetida
                </span>
              ) : null}
            </motion.article>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2 px-4 pb-4" aria-hidden="true">
        {sortedMedals.map((medal, index) => (
          <span
            key={medal.id}
            className={cn(
              "h-2 rounded-full transition-all duration-200",
              index === activeIndex ? "w-6 bg-panini-gold" : "w-2 bg-white/20",
              medal.earned && index !== activeIndex && "bg-emerald-400/60"
            )}
          />
        ))}
      </div>
    </AppCard>
  );
}
