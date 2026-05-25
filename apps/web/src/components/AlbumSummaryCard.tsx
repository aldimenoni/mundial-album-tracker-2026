import type { AlbumSummaryDto } from "@mundial-album/shared";

type SummaryMetric = {
  label: string;
  value: string | number;
  tone?: "green" | "red" | "blue" | "amber";
  onClick?: () => void;
  disabled?: boolean;
};

type AlbumSummaryCardProps = {
  summary: AlbumSummaryDto;
  onRepeatedClick?: () => void;
};

function MetricCard({ metric }: { metric: SummaryMetric }) {
  const className = `metric-card metric-${metric.tone ?? "blue"}${metric.onClick ? " metric-card-button" : ""}`;

  if (metric.onClick) {
    return (
      <button
        type="button"
        className={className}
        disabled={metric.disabled}
        onClick={metric.onClick}
      >
        <span>{metric.label}</span>
        <strong>{metric.value}</strong>
      </button>
    );
  }

  return (
    <article className={className}>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
    </article>
  );
}

export function AlbumSummaryCard({ summary, onRepeatedClick }: AlbumSummaryCardProps) {
  const metrics: SummaryMetric[] = [
    { label: "Total", value: summary.totalStickers, tone: "blue" },
    { label: "Tengo", value: summary.totalOwned, tone: "green" },
    { label: "Faltantes", value: summary.totalMissing, tone: "red" },
    {
      label: "Repetidas",
      value: summary.totalRepeated,
      tone: "amber",
      ...(onRepeatedClick
        ? {
            onClick: onRepeatedClick,
            disabled: summary.totalRepeated === 0
          }
        : {})
    },
    { label: "Completado", value: `${summary.completionPercentage}%`, tone: "green" },
    { label: "Coca-Cola", value: summary.totalCocaCola, tone: "blue" },
    { label: "CC faltantes", value: summary.missingCocaCola, tone: "red" },
    { label: "CC repetidas", value: summary.repeatedCocaCola, tone: "amber" }
  ];

  return (
    <section className="summary-panel" aria-label={`Resumen de ${summary.user.name}`}>
      <div className="summary-header">
        <div>
          <p className="eyebrow">Resumen</p>
          <h2>{summary.user.name}</h2>
        </div>
        <strong>{summary.completionPercentage}%</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${Math.min(summary.completionPercentage, 100)}%` }} />
      </div>
      <div className="metric-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}
