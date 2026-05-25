import type { SettlementOptionDto, StickerDto } from "@mundial-album/shared";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import { GradientButton, IconButton } from "./ui/GradientButton";

export type ExchangeSelection = {
  stickersGivenByMe: string[];
  stickersGivenByOther: string[];
};

type ExchangeOptionListProps = {
  options: SettlementOptionDto[];
  isBusy?: boolean;
  busyOptionKey?: string | null;
  onConfirmOne?: (selection: ExchangeSelection, optionKey: string) => void;
  onConfirmAll?: (selection: ExchangeSelection) => void;
  confirmAllLabel?: string;
  busyAllLabel?: string;
};

const ROW_SURFACE =
  "rounded-2xl border border-white/12 bg-white/8 p-3 backdrop-blur-md";

function optionKey(option: SettlementOptionDto): string {
  return `${option.give?.code ?? "-"}:${option.receive?.code ?? "-"}`;
}

function optionToSelection(option: SettlementOptionDto): ExchangeSelection {
  return {
    stickersGivenByMe: option.give ? [option.give.code] : [],
    stickersGivenByOther: option.receive ? [option.receive.code] : []
  };
}

export function optionsToAllSelection(options: SettlementOptionDto[]): ExchangeSelection {
  return options.reduce<ExchangeSelection>(
    (selection, option) => {
      if (option.give) {
        selection.stickersGivenByMe.push(option.give.code);
      }

      if (option.receive) {
        selection.stickersGivenByOther.push(option.receive.code);
      }

      return selection;
    },
    { stickersGivenByMe: [], stickersGivenByOther: [] }
  );
}

function StickerChip({
  sticker,
  tone
}: {
  sticker: StickerDto;
  tone: "give" | "receive";
}) {
  return (
    <div
      className={cn(
        "grid gap-0.5 rounded-xl border px-2 py-2 text-center text-[0.68rem] font-bold",
        tone === "give" && "border-amber-400/25 bg-white/5 text-amber-100",
        tone === "receive" && "border-emerald-400/25 bg-white/5 text-emerald-100"
      )}
    >
      <strong className="line-clamp-2 text-sm font-extrabold">{sticker.playerName ?? sticker.code}</strong>
      <span className="text-[0.72rem] font-bold text-white/55">{sticker.code}</span>
    </div>
  );
}

function ExchangeOptionRow({
  option,
  isBusy,
  onConfirm
}: {
  option: SettlementOptionDto;
  isBusy?: boolean;
  onConfirm?: () => void;
}) {
  const hasGive = Boolean(option.give);
  const hasReceive = Boolean(option.receive);

  return (
    <article className={cn(ROW_SURFACE, "grid gap-3", "grid-cols-[minmax(0,1fr)_auto]")}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="min-w-0">
          {hasReceive && option.receive ? (
            <StickerChip sticker={option.receive} tone="receive" />
          ) : null}
        </div>

        <div className="flex items-center justify-center text-white/45" aria-hidden="true">
          {hasGive && hasReceive ? <ArrowLeftRight size={16} /> : null}
        </div>

        <div className="min-w-0">
          {hasGive && option.give ? <StickerChip sticker={option.give} tone="give" /> : null}
        </div>
      </div>

      {onConfirm ? (
        <IconButton
          type="button"
          disabled={isBusy}
          aria-label={isBusy ? "Intercambiando figurita" : "Intercambiar figurita"}
          className="!h-11 !w-11 self-center"
          onClick={onConfirm}
        >
          {isBusy ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <ArrowLeftRight size={18} aria-hidden="true" />
          )}
        </IconButton>
      ) : null}
    </article>
  );
}

export function ExchangeOptionList({
  options,
  isBusy = false,
  busyOptionKey = null,
  onConfirmOne,
  onConfirmAll,
  confirmAllLabel = "Intercambiar todas",
  busyAllLabel = "Intercambiando todas..."
}: ExchangeOptionListProps) {
  if (options.length === 0) {
    return null;
  }

  const showConfirmAll = options.length > 1 && Boolean(onConfirmAll);
  const isConfirmingAll = isBusy && busyOptionKey === "all";

  return (
    <div className="grid gap-3">
      {options.length > 4 ? (
        <p className="text-[0.72rem] font-bold text-white/45">Deslizá para ver todos</p>
      ) : null}

      <div className="grid max-h-[min(20rem,52vh)] gap-2 overflow-y-auto overscroll-contain">
        {options.map((option) => {
          const key = optionKey(option);

          return (
            <ExchangeOptionRow
              key={key}
              option={option}
              isBusy={isBusy && busyOptionKey === key}
              {...(onConfirmOne
                ? {
                    onConfirm: () => onConfirmOne(optionToSelection(option), key)
                  }
                : {})}
            />
          );
        })}
      </div>

      {showConfirmAll ? (
        <GradientButton
          type="button"
          disabled={isBusy}
          onClick={() => onConfirmAll?.(optionsToAllSelection(options))}
        >
          {isConfirmingAll ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              {busyAllLabel}
            </>
          ) : (
            confirmAllLabel
          )}
        </GradientButton>
      ) : null}
    </div>
  );
}

export function suggestionsToOptions(
  suggestions: Array<{ give: StickerDto | null; receive: StickerDto | null }>
): SettlementOptionDto[] {
  return suggestions.map((suggestion) => ({
    give: suggestion.give,
    receive: suggestion.receive
  }));
}
