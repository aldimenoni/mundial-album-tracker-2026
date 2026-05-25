import type { ReactNode } from "react";
import { CheckCircle2, CircleHelp, Package, Sparkles, Star, Trophy } from "lucide-react";
import type { AlbumSummaryDto } from "@mundial-album/shared";
import { AppCard } from "./ui/AppCard";
import { AnimatedProgress } from "./ui/AnimatedProgress";
import { HolographicBadge, UserAvatar } from "./ui/Badges";
import { cn } from "../lib/cn";
import { formatCompletionPercent } from "../lib/format-percent";
import { getCollectionLevel } from "../lib/user-visuals";

type AlbumSummaryCardProps = {
  summary: AlbumSummaryDto;
  onRepeatedClick?: () => void;
};

function formatLastUpdatedAt(value: string | null): string {
  if (!value) {
    return "Sin cambios registrados";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function QuickStatCard({
  icon,
  value,
  label
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-h-[5.75rem] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center">
      <div className="mb-1.5 flex h-4 items-center justify-center">{icon}</div>
      <strong className="block text-sm font-black leading-none text-white">{value}</strong>
      <span className="mt-1.5 text-[0.62rem] font-bold uppercase leading-tight tracking-wide text-white/55">
        {label}
      </span>
    </div>
  );
}

function StatRow({
  label,
  value,
  valueClassName,
  action
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
      <span className="text-xs font-extrabold uppercase tracking-wide text-white/55">{label}</span>
      <div className="flex items-center gap-2">
        <strong className={cn("text-lg font-black tabular-nums text-white", valueClassName)}>
          {value}
        </strong>
        {action}
      </div>
    </div>
  );
}

export function AlbumSummaryCard({ summary, onRepeatedClick }: AlbumSummaryCardProps) {
  const completionPercent = formatCompletionPercent(summary.completionPercentage);
  const level = getCollectionLevel(completionPercent);
  const closestSpread = summary.spreadProgress[0];
  const earnedLegendary = summary.legendaryMedals.filter((medal) => medal.earned).length;
  const completedSpreads = summary.spreadProgress.filter((spread) => spread.missing === 0).length;
  const totalSpreads = summary.spreadProgress.length;
  const canOpenRepeated = Boolean(onRepeatedClick) && summary.totalRepeated > 0;

  return (
    <AppCard glow className="p-0">
      <div className="space-y-4 border-b border-white/10 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar name={summary.user.name} size="lg" />
          <div className="min-w-0">
            <HolographicBadge tone={level.tone === "legend" ? "legendary" : "gold"}>
              <Trophy size={12} />
              {level.label}
            </HolographicBadge>
            <h2 className="mt-2 truncate text-2xl font-black text-white">{summary.user.name}</h2>
            <p className="mt-1 text-xs font-semibold text-white/60">
              Última actualización: {formatLastUpdatedAt(summary.lastUpdatedAt)}
            </p>
          </div>
        </div>

        <AnimatedProgress value={summary.completionPercentage} showLabel />

        <div className="grid grid-cols-3 gap-2">
          <QuickStatCard
            icon={<Sparkles className="text-panini-gold" size={16} />}
            value={earnedLegendary}
            label="Estrellas"
          />
          <QuickStatCard
            icon={<Package className="text-emerald-300" size={16} />}
            value={summary.totalRepeated}
            label="Repetidas"
          />
          <QuickStatCard
            icon={<CheckCircle2 className="text-emerald-300" size={16} />}
            value={`${completedSpreads}/${totalSpreads}`}
            label="Cuadros listos"
          />
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-panini-gold">
          Figuritas
        </p>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div>
            <span className="text-[0.65rem] font-extrabold uppercase tracking-wide text-white/55">
              Tengo
            </span>
            <strong className="mt-1 block text-2xl font-black tabular-nums text-emerald-300">
              {summary.totalOwned}
            </strong>
          </div>
          <div className="text-right">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-wide text-white/55">
              Faltan
            </span>
            <strong className="mt-1 block text-2xl font-black tabular-nums text-rose-200">
              {summary.totalMissing}
            </strong>
          </div>
        </div>

        {canOpenRepeated ? (
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-3 py-2.5 text-left transition-transform active:scale-[0.99]"
            onClick={onRepeatedClick}
          >
            <span className="text-xs font-extrabold uppercase tracking-wide text-amber-100/80">
              Repetidas
            </span>
            <div className="flex items-center gap-2">
              <strong className="text-lg font-black tabular-nums text-amber-100">
                {summary.totalRepeated}
              </strong>
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/30 bg-amber-500/15 text-amber-100"
                aria-hidden="true"
              >
                <CircleHelp size={15} />
              </span>
            </div>
          </button>
        ) : (
          <StatRow
            label="Repetidas"
            value={summary.totalRepeated}
            valueClassName="text-amber-100"
          />
        )}

        <StatRow label="Total" value={summary.totalStickers} />

        <p className="pt-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-panini-gold">
          Coca-Cola
        </p>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div>
            <span className="text-[0.65rem] font-extrabold uppercase tracking-wide text-white/55">
              Faltantes
            </span>
            <strong className="mt-1 block text-2xl font-black tabular-nums text-rose-200">
              {summary.missingCocaCola}
            </strong>
          </div>
          <div className="text-right">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-wide text-white/55">
              Total
            </span>
            <strong className="mt-1 block text-2xl font-black tabular-nums text-white">
              {summary.totalCocaCola}
            </strong>
          </div>
        </div>
      </div>

      {closestSpread ? (
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-sm font-semibold text-white/80">
            {closestSpread.missing === 1
              ? `¡Te falta solo 1 para completar ${closestSpread.label}!`
              : `Te faltan ${closestSpread.missing} para completar ${closestSpread.label}`}
          </p>
        </div>
      ) : completionPercent >= 100 ? (
        <div className="border-t border-white/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold text-panini-gold">
            <Star size={16} />
            Álbum completado. Leyenda absoluta.
          </p>
        </div>
      ) : null}
    </AppCard>
  );
}
