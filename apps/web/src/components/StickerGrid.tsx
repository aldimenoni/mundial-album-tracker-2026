import type { UpdateUserStickerPayload, UserStickerDto } from "@mundial-album/shared";
import { cn } from "../lib/cn";
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
    <div
      className={cn(
        "grid auto-rows-fr gap-2 p-3",
        compact ? "grid-cols-2" : "grid-cols-1"
      )}
    >
      {items.map((item) => (
        <div key={item.stickerId} className="min-w-0">
          <StickerCard
            item={item}
            editable={editable}
            compact={compact}
            showTypeIcon={showTypeIcon}
            onUpdate={onUpdate}
          />
        </div>
      ))}
    </div>
  );
}
