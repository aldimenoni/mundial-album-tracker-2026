import type { AlbumStickerStatus } from "@mundial-album/shared";

const labels: Record<AlbumStickerStatus, string> = {
  missing: "Faltante",
  owned: "Tengo",
  repeated: "Repetida"
};

export function StatusBadge({ status }: { status: AlbumStickerStatus }) {
  return <span className={`status-badge status-${status}`}>{labels[status]}</span>;
}
