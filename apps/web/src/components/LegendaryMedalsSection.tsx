import type { CSSProperties } from "react";
import type { LegendaryPlayerMedalDto } from "@mundial-album/shared";
import { getFlagSrc, getTeamTheme } from "@mundial-album/shared";
import { Medal, Star } from "lucide-react";

type LegendaryMedalsSectionProps = {
  medals: LegendaryPlayerMedalDto[];
};

export function LegendaryMedalsSection({ medals }: LegendaryMedalsSectionProps) {
  const earnedCount = medals.filter((medal) => medal.earned).length;

  return (
    <section className="summary-panel legendary-medals-panel" aria-label="Jugadores estrella conseguidos">
      <div className="summary-section-header">
        <div>
          <p className="eyebrow">Colección especial</p>
          <h3>Jugadores estrella</h3>
        </div>
        <span className="summary-section-note">
          {earnedCount}/{medals.length} desbloqueadas
        </span>
      </div>

      <div className="legendary-medals-grid">
        {medals.map((medal) => {
          const theme = getTeamTheme(medal.team) ?? {
            flagCode: "xx",
            primary: "#0b1f4b",
            secondary: "#003087",
            accent: "#00a651"
          };
          const flagSrc = getFlagSrc(theme.flagCode);

          return (
            <article
              key={medal.id}
              className={medal.earned ? "legendary-medal is-earned" : "legendary-medal"}
              style={
                {
                  "--medal-primary": theme.primary,
                  "--medal-secondary": theme.secondary,
                  "--medal-accent": theme.accent
                } as CSSProperties
              }
            >
              <div className="legendary-medal-visual">
                <img
                  className="legendary-medal-portrait"
                  src={medal.portraitSrc}
                  alt={medal.name}
                  loading="lazy"
                />
                <img className="legendary-medal-flag" src={flagSrc} alt="" aria-hidden="true" />
                {medal.earned ? (
                  <span className="legendary-medal-badge" aria-label="Medalla desbloqueada">
                    <Medal size={16} aria-hidden="true" />
                  </span>
                ) : null}
              </div>

              <div className="legendary-medal-copy">
                <strong>{medal.shortName}</strong>
                <span>{medal.stickerCode}</span>
                <p>{medal.earned ? (medal.repeated ? "Repetida en tu álbum" : "Figurita conseguida") : "Todavía no la tenés"}</p>
              </div>

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
    </section>
  );
}
