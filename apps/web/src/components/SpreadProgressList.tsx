import { Link } from "react-router-dom";
import type { AlbumSpreadProgressDto } from "@mundial-album/shared";
import { getFlagSrc, getTeamTheme } from "@mundial-album/shared";
import { ChevronRight } from "lucide-react";

type SpreadProgressListProps = {
  spreads: AlbumSpreadProgressDto[];
};

export function SpreadProgressList({ spreads }: SpreadProgressListProps) {
  if (spreads.length === 0) {
    return null;
  }

  return (
    <section className="summary-panel spread-progress-panel" aria-label="Cuadros por completar">
      <div className="summary-section-header">
        <div>
          <p className="eyebrow">Ranking</p>
          <h3>Cuadros por completar</h3>
        </div>
      </div>

      <ol className="spread-progress-list">
        {spreads.map((spread, index) => {
          const theme = getTeamTheme(spread.team);
          const flagSrc = theme ? getFlagSrc(theme.flagCode) : null;

          return (
            <li key={spread.spreadId} className="spread-progress-item">
              <span className="spread-progress-rank">{index + 1}</span>
              {flagSrc ? (
                <img
                  className="spread-progress-flag"
                  src={flagSrc}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
              ) : null}
              <div className="spread-progress-copy">
                <strong>{spread.label}</strong>
                {spread.subtitle ? <span>{spread.subtitle}</span> : null}
              </div>
              <div className="spread-progress-stats">
                <span className="spread-progress-missing">
                  {spread.missing} {spread.missing === 1 ? "faltante" : "faltantes"}
                </span>
                <div className="spread-progress-track" aria-hidden="true">
                  <span style={{ width: `${Math.min(spread.completionPercentage, 100)}%` }} />
                </div>
                <span className="spread-progress-percent">{spread.completionPercentage}%</span>
              </div>
              <Link
                className="spread-progress-link"
                to={`/mi-album?cuadro=${encodeURIComponent(spread.team)}`}
                aria-label={`Ver ${spread.label} en el álbum`}
                title={`Ver ${spread.label} en el álbum`}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
