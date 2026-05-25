import type { AlbumStickerStatus } from "@mundial-album/shared";
import { cn } from "../lib/cn";

const STATUS_LABELS: Record<AlbumStickerStatus, string> = {
  missing: "Faltante",
  owned: "Tengo",
  repeated: "Repetida"
};

type StatusBadgeProps = {
  status: AlbumStickerStatus;
  fullWidth?: boolean;
};

export function StatusBadge({ status, fullWidth = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "font-extrabold uppercase tracking-wider",
        fullWidth
          ? "block w-full py-1.5 text-center text-[0.62rem]"
          : "inline-flex rounded-full px-2.5 py-1 text-[0.65rem]",
        status === "missing" && (fullWidth ? "bg-rose-600 text-white" : "bg-rose-600/25 text-rose-100"),
        status === "owned" && (fullWidth ? "bg-emerald-600 text-white" : "bg-emerald-600/25 text-emerald-100"),
        status === "repeated" && (fullWidth ? "bg-amber-600 text-white" : "bg-amber-600/25 text-amber-100")
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
