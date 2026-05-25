import type { AlbumSpreadProgressDto } from "@mundial-album/shared";

type SpreadProgressListProps = {
  spreads: AlbumSpreadProgressDto[];
};

export function SpreadProgressList({ spreads }: SpreadProgressListProps) {
  if (spreads.length === 0) {
    return null;
  }

  const closestSpreads = spreads;

  return (
    <section className="summary-panel spread-progress-panel" aria-label="Cuadros por completar">
      <div className="summary-section-header">
        <div>
          <p className="eyebrow">Ranking</p>
          <h3>Cuadros por completar</h3>
        </div>
      </div>

      <ol className="spread-progress-list">
        {closestSpreads.map((spread, index) => (
          <li key={spread.spreadId} className="spread-progress-item">
            <span className="spread-progress-rank">{index + 1}</span>
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
          </li>
        ))}
      </ol>
    </section>
  );
}
