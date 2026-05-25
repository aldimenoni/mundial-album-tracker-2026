import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "pill";
};

const roundedClassName = {
  sm: "skeleton-rounded-sm",
  md: "skeleton-rounded-md",
  lg: "skeleton-rounded-lg",
  pill: "skeleton-rounded-pill"
} as const;

export function Skeleton({
  width,
  height,
  rounded = "md",
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton ${roundedClassName[rounded]} ${className}`.trim()}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = ""
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`skeleton-stack ${className}`.trim()}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={index === lines - 1 ? "skeleton-line skeleton-line-short" : "skeleton-line"}
        />
      ))}
    </div>
  );
}

export function RouteFallback() {
  return (
    <section className="stack" aria-busy="true" aria-label="Cargando pagina">
      <div className="page-heading">
        <Skeleton className="skeleton-line skeleton-line-xs" />
        <Skeleton className="skeleton-line skeleton-line-lg" />
      </div>
      <Skeleton className="skeleton-panel skeleton-panel-tall" />
    </section>
  );
}

export function SummaryPageSkeleton() {
  return (
    <div className="stack" aria-busy="true" aria-label="Cargando resumen">
      <Skeleton className="skeleton-panel">
        <div className="skeleton-summary-header">
          <div className="skeleton-stack skeleton-stack-tight">
            <Skeleton className="skeleton-line skeleton-line-xs" />
            <Skeleton className="skeleton-line skeleton-line-lg" />
            <Skeleton className="skeleton-line skeleton-line-sm" />
          </div>
          <Skeleton className="skeleton-circle skeleton-circle-lg" rounded="pill" />
        </div>
        <Skeleton className="skeleton-line skeleton-line-full skeleton-progress" />
        <div className="skeleton-metric-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="skeleton-metric-card" />
          ))}
        </div>
      </Skeleton>

      <Skeleton className="skeleton-panel">
        <Skeleton className="skeleton-line skeleton-line-md" />
        <div className="skeleton-medal-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="skeleton-medal-card" />
          ))}
        </div>
      </Skeleton>

      <Skeleton className="skeleton-panel">
        <Skeleton className="skeleton-line skeleton-line-md" />
        <div className="skeleton-list">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="skeleton-list-row" />
          ))}
        </div>
      </Skeleton>
    </div>
  );
}

export function AlbumPageSkeleton() {
  return (
    <div className="stack" aria-busy="true" aria-label="Cargando album">
      <Skeleton className="skeleton-line skeleton-line-md" />
      <Skeleton className="skeleton-panel skeleton-spread-panel">
        <Skeleton className="skeleton-line skeleton-line-sm" />
        <Skeleton className="skeleton-spread-hero" />
        <div className="skeleton-sticker-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="skeleton-sticker-card" />
          ))}
        </div>
      </Skeleton>
    </div>
  );
}

export function ExchangePageSkeleton() {
  return (
    <div className="stack" aria-busy="true" aria-label="Cargando intercambios">
      {Array.from({ length: 2 }, (_, index) => (
        <Skeleton key={index} className="skeleton-panel skeleton-exchange-card">
          <Skeleton className="skeleton-line skeleton-line-md" />
          <SkeletonText lines={2} />
          <Skeleton className="skeleton-line skeleton-line-full skeleton-button" />
        </Skeleton>
      ))}
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="stack" aria-busy="true" aria-label="Cargando buscador">
      <Skeleton className="skeleton-panel">
        <Skeleton className="skeleton-line skeleton-line-md" />
        <Skeleton className="skeleton-line skeleton-line-full skeleton-input" />
        <Skeleton className="skeleton-line skeleton-line-full skeleton-button" />
      </Skeleton>
    </div>
  );
}

export function UserListSkeleton() {
  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Cargando usuarios">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="skeleton-list-row skeleton-list-row-action" />
      ))}
    </div>
  );
}
