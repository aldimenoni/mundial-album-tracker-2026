import type { UpdateUserStickerPayload, UserStickerDto } from "@mundial-album/shared";
import { Check, CopyPlus, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

type StickerCardProps = {
  item: UserStickerDto;
  editable?: boolean;
  compact?: boolean;
  onUpdate?: ((stickerId: string, payload: UpdateUserStickerPayload) => Promise<void>) | undefined;
};

export function StickerCard({ item, editable = false, compact = false, onUpdate }: StickerCardProps) {
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

  return (
    <article className={`sticker-card ${compact ? "sticker-card-compact" : ""}`}>
      <div className="sticker-card-header">
        <div>
          <strong>{item.sticker.code}</strong>
          <span>{item.sticker.section ?? "Album"}</span>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="sticker-card-body">
        <p>{item.sticker.playerName ?? "Sin nombre"}</p>
        <small>
          #{item.sticker.number ?? "-"} · {item.sticker.type.replace("_", " ")}
        </small>
      </div>

      <div className="sticker-counts">
        <span>Propias: {item.quantityOwned}</span>
        <span>Repetidas: {item.quantityRepeated}</span>
      </div>

      {editable ? (
        <div className="sticker-actions" aria-label={`Actualizar ${item.sticker.code}`}>
          <button
            type="button"
            title="Marcar faltante"
            disabled={isSaving}
            onClick={() => void handleUpdate({ status: "missing" })}
          >
            <X size={16} aria-hidden="true" />
            Faltante
          </button>
          <button
            type="button"
            title="Marcar como tengo"
            disabled={isSaving}
            onClick={() => void handleUpdate({ status: "owned", quantityOwned: 1 })}
          >
            <Check size={16} aria-hidden="true" />
            Tengo
          </button>
          <button
            type="button"
            title="Marcar repetida"
            disabled={isSaving}
            onClick={() =>
              void handleUpdate({
                status: "repeated",
                quantityOwned: Math.max(item.quantityOwned, 1),
                quantityRepeated: Math.max(item.quantityRepeated, 1)
              })
            }
          >
            <CopyPlus size={16} aria-hidden="true" />
            Repetida
          </button>
          <div className="stepper" aria-label="Cantidad repetida">
            <button
              type="button"
              title="Restar repetida"
              disabled={isSaving || repeatedQuantity === 0}
              onClick={() => {
                const nextQuantity = Math.max(repeatedQuantity - 1, 0);
                void handleUpdate(
                  nextQuantity > 0
                    ? { status: "repeated", quantityRepeated: nextQuantity }
                    : { status: item.quantityOwned > 0 ? "owned" : "missing", quantityRepeated: 0 }
                );
              }}
            >
              <Minus size={15} aria-hidden="true" />
            </button>
            <input
              aria-label="Cantidad repetida"
              min={0}
              type="number"
              value={repeatedQuantity}
              disabled={isSaving}
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
              disabled={isSaving}
              onClick={() =>
                void handleUpdate({
                  status: "repeated",
                  quantityRepeated: repeatedQuantity + 1
                })
              }
            >
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
