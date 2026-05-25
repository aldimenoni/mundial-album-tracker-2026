import { useMemo, useState } from "react";
import type { StickerDto } from "@mundial-album/shared";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import { GradientButton } from "./ui/GradientButton";
import type { ExchangeSelection } from "./ExchangeOptionList";

type CustomExchangePanelProps = {
  myRepeatedStickers: StickerDto[];
  otherRepeatedStickers: StickerDto[];
  otherUserName: string;
  isBusy?: boolean;
  isBusyCustom?: boolean;
  onConfirm?: (selection: ExchangeSelection) => void;
};

const COLUMN_SURFACE = "rounded-2xl border border-white/10 bg-white/5 p-3";
const SEARCH_INPUT =
  "min-h-10 w-full min-w-[120px] max-w-[180px] rounded-full border border-white/15 bg-white/10 px-3 text-sm text-white outline-none backdrop-blur-md placeholder:text-white/40 focus:border-panini-gold/50";

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
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "grid w-full gap-0.5 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition-colors",
        tone === "give" && "border-amber-400/25 bg-white/5 text-amber-100",
        tone === "receive" && "border-emerald-400/25 bg-white/5 text-emerald-100",
        selected && "ring-2 ring-panini-gold/60 ring-offset-1 ring-offset-transparent"
      )}
    >
      <strong className="line-clamp-2 text-sm font-extrabold">{sticker.playerName ?? sticker.code}</strong>
      <span className="text-[0.72rem] font-bold text-white/55">{sticker.code}</span>
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
    <details className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-extrabold text-white/80 [&::-webkit-details-marker]:hidden">
        Intercambio personalizado
      </summary>

      <div className="grid gap-3 border-t border-white/10 p-3">
        <p className="text-sm font-semibold leading-relaxed text-white/65">
          Elegí figuritas de tus repetidas y de las de @{otherUserName}. No hace falta que coincidan
          con las sugeridas.
        </p>

        <div className="grid gap-3">
          <div className={COLUMN_SURFACE}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/55">
                Das ({giveCount})
              </h4>
              <input
                className={SEARCH_INPUT}
                type="search"
                placeholder="Buscar..."
                value={giveFilter}
                onChange={(event) => setGiveFilter(event.target.value)}
              />
            </div>
            {filteredGive.length > 0 ? (
              <div className="grid max-h-48 gap-2 overflow-y-auto overscroll-contain">
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
              <p className="text-sm font-semibold text-white/45">No tenés repetidas cargadas.</p>
            )}
          </div>

          <div className={COLUMN_SURFACE}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/55">
                Recibís ({receiveCount})
              </h4>
              <input
                className={SEARCH_INPUT}
                type="search"
                placeholder="Buscar..."
                value={receiveFilter}
                onChange={(event) => setReceiveFilter(event.target.value)}
              />
            </div>
            {filteredReceive.length > 0 ? (
              <div className="grid max-h-48 gap-2 overflow-y-auto overscroll-contain">
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
              <p className="text-sm font-semibold text-white/45">
                @{otherUserName} todavía no tiene repetidas cargadas.
              </p>
            )}
          </div>
        </div>

        {onConfirm ? (
          <GradientButton
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
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Confirmando...
              </>
            ) : (
              "Confirmar intercambio personalizado"
            )}
          </GradientButton>
        ) : null}
      </div>
    </details>
  );
}
