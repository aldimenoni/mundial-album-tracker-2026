import type { StickerType, UpdateUserStickerPayload, UserStickerDto } from "@mundial-album/shared";
import { Check, CopyPlus, Minus, Plus, Star, X } from "lucide-react";
import { memo, useState, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { StatusBadge } from "./StatusBadge";

type StickerCardProps = {
  item: UserStickerDto;
  editable?: boolean;
  compact?: boolean;
  showTypeIcon?: boolean;
  onUpdate?: ((stickerId: string, payload: UpdateUserStickerPayload) => Promise<void>) | undefined;
};

function StickerTypeIcon({ type }: { type: StickerType }) {
  if (type === "SPECIAL") {
    return <Star size={14} className="shrink-0 text-panini-gold" aria-hidden="true" />;
  }

  if (type === "COCA_COLA") {
    return (
      <img
        src="/brand/coca-cola-mark.svg"
        alt=""
        className="h-3.5 w-3.5 shrink-0"
        aria-hidden="true"
      />
    );
  }

  return null;
}

const CARD_SURFACE = "border border-white/25 bg-[#101e36] shadow-sm";

function ActionButton({
  label,
  icon,
  tone,
  disabled,
  onClick
}: {
  label: string;
  icon: ReactNode;
  tone: "neutral" | "owned" | "repeated";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border px-2 py-2 text-[0.62rem] font-extrabold uppercase tracking-wide text-white transition-transform active:scale-[0.97] disabled:opacity-45",
        tone === "owned" && "border-emerald-400/30 bg-emerald-500/15",
        tone === "repeated" && "border-amber-400/30 bg-amber-500/15",
        tone === "neutral" && "border-white/10 bg-white/10"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export const StickerCard = memo(function StickerCard({
  item,
  editable = false,
  compact = false,
  showTypeIcon = true,
  onUpdate
}: StickerCardProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleUpdate(payload: UpdateUserStickerPayload): Promise<void> {
    if (!onUpdate || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await onUpdate(item.stickerId, payload);
    } finally {
      setIsSaving(false);
    }
  }

  const repeatedQuantity = item.quantityRepeated;
  const playerName = item.sticker.playerName ?? "Sin nombre";

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-xl",
        CARD_SURFACE
      )}
    >
      <StatusBadge status={item.status} fullWidth />

      <div className={cn("flex min-h-0 flex-1 flex-col gap-2", compact ? "p-2" : "p-3")}>
        <div className="min-w-0 space-y-1">
          <div className="flex min-w-0 items-start justify-between gap-1">
            <strong className="truncate text-sm font-black tracking-wide text-white">
              {item.sticker.code}
            </strong>
            {showTypeIcon ? <StickerTypeIcon type={item.sticker.type} /> : null}
          </div>
          <p className="truncate text-xs font-bold text-white/90" title={playerName}>
            {playerName}
          </p>
        </div>

        {editable ? (
          <div className="mt-auto grid gap-2" aria-label={`Actualizar ${item.sticker.code}`}>
            <ActionButton
              label="Faltante"
              icon={<X size={16} aria-hidden="true" />}
              tone="neutral"
              disabled={isSaving}
              onClick={() => void handleUpdate({ status: "missing" })}
            />
            <ActionButton
              label="Tengo"
              icon={<Check size={16} aria-hidden="true" />}
              tone="owned"
              disabled={isSaving}
              onClick={() => void handleUpdate({ status: "owned", quantityOwned: 1 })}
            />
            <ActionButton
              label="Repetida"
              icon={<CopyPlus size={16} aria-hidden="true" />}
              tone="repeated"
              disabled={isSaving}
              onClick={() =>
                void handleUpdate({
                  status: "repeated",
                  quantityOwned: Math.max(item.quantityOwned, 1),
                  quantityRepeated: repeatedQuantity + 1
                })
              }
            />

            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl p-1",
                "bg-black/15"
              )}
              aria-label="Cantidad repetida"
            >
              <button
                type="button"
                title="Restar repetida"
                aria-label="Restar repetida"
                disabled={isSaving || repeatedQuantity === 0}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white disabled:opacity-40"
                onClick={() => {
                  const nextQuantity = Math.max(repeatedQuantity - 1, 0);
                  void handleUpdate(
                    nextQuantity > 0
                      ? { status: "repeated", quantityRepeated: nextQuantity }
                      : { status: item.quantityOwned > 0 ? "owned" : "missing", quantityRepeated: 0 }
                  );
                }}
              >
                <Minus size={14} aria-hidden="true" />
              </button>
              <input
                aria-label="Cantidad repetida"
                min={0}
                type="number"
                inputMode="numeric"
                value={repeatedQuantity}
                disabled={isSaving}
                className="h-9 w-12 shrink-0 appearance-none rounded-lg border border-white/15 bg-white/10 px-1 text-center text-sm font-black leading-none text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                onChange={(event) => {
                  const nextQuantity = Math.max(Number(event.currentTarget.value), 0);
                  void handleUpdate(
                    nextQuantity > 0
                      ? { status: "repeated", quantityRepeated: nextQuantity }
                      : { status: item.quantityOwned > 0 ? "owned" : "missing", quantityRepeated: 0 }
                  );
                }}
              />
              <button
                type="button"
                title="Sumar repetida"
                aria-label="Sumar repetida"
                disabled={isSaving}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white"
                onClick={() =>
                  void handleUpdate({
                    status: "repeated",
                    quantityRepeated: repeatedQuantity + 1
                  })
                }
              >
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
});
