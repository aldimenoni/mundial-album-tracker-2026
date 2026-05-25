import type { UpdateUserStickerPayload, UserStickerDto } from "@mundial-album/shared";
import { StickerCard } from "./StickerCard";

type StickerGridProps = {
  items: UserStickerDto[];
  editable?: boolean;
  compact?: boolean;
  showTypeIcon?: boolean;
  emptyMessage?: string;
  onUpdate?: ((stickerId: string, payload: UpdateUserStickerPayload) => Promise<void>) | undefined;
};

export function StickerGrid({
  items,
  editable = false,
  compact = false,
  showTypeIcon = true,
  emptyMessage = "No hay figuritas para mostrar.",
  onUpdate
}: StickerGridProps) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className={`sticker-grid ${compact ? "sticker-grid-compact" : ""}`}>
      {items.map((item) => (
        <StickerCard
          key={item.stickerId}
          item={item}
          editable={editable}
          compact={compact}
          showTypeIcon={showTypeIcon}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
