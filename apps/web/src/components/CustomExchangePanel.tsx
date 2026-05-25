import { useMemo, useState } from "react";
import type { StickerDto } from "@mundial-album/shared";
import { Loader2 } from "lucide-react";
import type { ExchangeSelection } from "./ExchangeOptionList";

type CustomExchangePanelProps = {
  myRepeatedStickers: StickerDto[];
  otherRepeatedStickers: StickerDto[];
  otherUserName: string;
  isBusy?: boolean;
  isBusyCustom?: boolean;
  onConfirm?: (selection: ExchangeSelection) => void;
};

function filterStickers(stickers: StickerDto[], query: string): StickerDto[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return stickers;
  }

  return stickers.filter((sticker) => {
    const label = `${sticker.code} ${sticker.playerName ?? ""} ${sticker.team ?? ""}`.toLowerCase();
    return label.includes(normalized);
  });
}

function StickerPickerChip({
  sticker,
  tone,
  selected,
  onToggle
}: {
  sticker: StickerDto;
  tone: "give" | "receive";
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`custom-exchange-chip custom-exchange-chip-${tone}${selected ? " custom-exchange-chip-selected" : ""}`}
      aria-pressed={selected}
      onClick={onToggle}
    >
      <strong>{sticker.playerName ?? sticker.code}</strong>
      <span>{sticker.code}</span>
    </button>
  );
}

export function CustomExchangePanel({
  myRepeatedStickers,
  otherRepeatedStickers,
  otherUserName,
  isBusy = false,
  isBusyCustom = false,
  onConfirm
}: CustomExchangePanelProps) {
  const [giveFilter, setGiveFilter] = useState("");
  const [receiveFilter, setReceiveFilter] = useState("");
  const [selectedGive, setSelectedGive] = useState<string[]>([]);
  const [selectedReceive, setSelectedReceive] = useState<string[]>([]);

  const filteredGive = useMemo(
    () => filterStickers(myRepeatedStickers, giveFilter),
    [giveFilter, myRepeatedStickers]
  );
  const filteredReceive = useMemo(
    () => filterStickers(otherRepeatedStickers, receiveFilter),
    [otherRepeatedStickers, receiveFilter]
  );

  const giveCount = selectedGive.length;
  const receiveCount = selectedReceive.length;
  const canConfirm = giveCount > 0 || receiveCount > 0;

  function toggleCode(codes: string[], code: string): string[] {
    return codes.includes(code) ? codes.filter((item) => item !== code) : [...codes, code];
  }

  return (
    <details className="custom-exchange-panel">
      <summary className="custom-exchange-summary">Intercambio personalizado</summary>

      <div className="custom-exchange-body">
        <p className="custom-exchange-hint">
          Elegí figuritas de tus repetidas y de las de @{otherUserName}. No hace falta que coincidan
          con las sugeridas.
        </p>

        <div className="custom-exchange-columns">
          <div className="custom-exchange-column">
            <div className="custom-exchange-column-heading">
              <h4>Das ({giveCount})</h4>
              <input
                className="custom-exchange-search"
                type="search"
                placeholder="Buscar..."
                value={giveFilter}
                onChange={(event) => setGiveFilter(event.target.value)}
              />
            </div>
            {filteredGive.length > 0 ? (
              <div className="custom-exchange-chip-list">
                {filteredGive.map((sticker) => (
                  <StickerPickerChip
                    key={sticker.code}
                    sticker={sticker}
                    tone="give"
                    selected={selectedGive.includes(sticker.code)}
                    onToggle={() => setSelectedGive((current) => toggleCode(current, sticker.code))}
                  />
                ))}
              </div>
            ) : (
              <p className="custom-exchange-empty">No tenés repetidas cargadas.</p>
            )}
          </div>

          <div className="custom-exchange-column">
            <div className="custom-exchange-column-heading">
              <h4>Recibís ({receiveCount})</h4>
              <input
                className="custom-exchange-search"
                type="search"
                placeholder="Buscar..."
                value={receiveFilter}
                onChange={(event) => setReceiveFilter(event.target.value)}
              />
            </div>
            {filteredReceive.length > 0 ? (
              <div className="custom-exchange-chip-list">
                {filteredReceive.map((sticker) => (
                  <StickerPickerChip
                    key={sticker.code}
                    sticker={sticker}
                    tone="receive"
                    selected={selectedReceive.includes(sticker.code)}
                    onToggle={() =>
                      setSelectedReceive((current) => toggleCode(current, sticker.code))
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="custom-exchange-empty">
                @{otherUserName} todavía no tiene repetidas cargadas.
              </p>
            )}
          </div>
        </div>

        {onConfirm ? (
          <button
            className="primary-button custom-exchange-confirm"
            type="button"
            disabled={!canConfirm || isBusy}
            onClick={() =>
              onConfirm({
                stickersGivenByMe: selectedGive,
                stickersGivenByOther: selectedReceive
              })
            }
          >
            {isBusyCustom ? (
              <>
                <Loader2 size={18} className="exchange-option-spinner" aria-hidden="true" />
                Confirmando...
              </>
            ) : (
              "Confirmar intercambio personalizado"
            )}
          </button>
        ) : null}
      </div>
    </details>
  );
}
