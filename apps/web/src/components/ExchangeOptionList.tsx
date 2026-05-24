import type { SettlementOptionDto, StickerDto } from "@mundial-album/shared";
import { ArrowLeftRight, Loader2 } from "lucide-react";

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

function optionKey(option: SettlementOptionDto): string {
  return `${option.give?.code ?? "-"}:${option.receive?.code ?? "-"}`;
}

function mergeOptions(options: SettlementOptionDto[]): ExchangeSelection {
  return options.reduce<ExchangeSelection>(
    (selection, option) => ({
      stickersGivenByMe: option.give
        ? [...selection.stickersGivenByMe, option.give.code]
        : selection.stickersGivenByMe,
      stickersGivenByOther: option.receive
        ? [...selection.stickersGivenByOther, option.receive.code]
        : selection.stickersGivenByOther
    }),
    { stickersGivenByMe: [], stickersGivenByOther: [] }
  );
}

function optionToSelection(option: SettlementOptionDto): ExchangeSelection {
  return {
    stickersGivenByMe: option.give ? [option.give.code] : [],
    stickersGivenByOther: option.receive ? [option.receive.code] : []
  };
}

function StickerChip({
  sticker,
  tone
}: {
  sticker: StickerDto;
  tone: "give" | "receive";
}) {
  return (
    <div className={`suggestion-sticker suggestion-sticker-${tone}`}>
      <strong>{sticker.playerName ?? sticker.code}</strong>
      <span>{sticker.code}</span>
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
    <article className="exchange-option-row">
      <div className="exchange-option-trade">
        <div className="exchange-option-slot exchange-option-slot-receive">
          {hasReceive && option.receive ? (
            <StickerChip sticker={option.receive} tone="receive" />
          ) : null}
        </div>

        <div className="exchange-option-divider" aria-hidden="true">
          {hasGive && hasReceive ? <ArrowLeftRight size={16} /> : null}
        </div>

        <div className="exchange-option-slot exchange-option-slot-give">
          {hasGive && option.give ? <StickerChip sticker={option.give} tone="give" /> : null}
        </div>
      </div>

      {onConfirm ? (
        <button
          className="primary-button exchange-option-confirm"
          type="button"
          disabled={isBusy}
          aria-label={isBusy ? "Intercambiando figurita" : "Intercambiar figurita"}
          onClick={onConfirm}
        >
          {isBusy ? (
            <Loader2 size={18} className="exchange-option-spinner" aria-hidden="true" />
          ) : (
            <ArrowLeftRight size={18} aria-hidden="true" />
          )}
        </button>
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
    return (
      <p className="pending-settlement-hint">
        Cuando el otro cargue repetidas, vas a poder saldar acá.
      </p>
    );
  }

  const allSelection = mergeOptions(options);

  return (
    <div className="suggestions">
      <div className="suggestions-heading">
        <h3>Cambios disponibles</h3>
        {options.length > 4 ? (
          <span className="suggestions-scroll-hint">Deslizá para ver todos</span>
        ) : null}
      </div>

      <div className="suggestion-list">
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

      {options.length > 1 && onConfirmAll ? (
        <div className="exchange-action-buttons exchange-action-buttons-all">
          <button
            className="primary-button"
            type="button"
            disabled={isBusy}
            onClick={() => onConfirmAll(allSelection)}
          >
            {isBusy && busyOptionKey === "all" ? busyAllLabel : confirmAllLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function suggestionsToOptions(suggestions: Array<{ give: StickerDto | null; receive: StickerDto | null }>): SettlementOptionDto[] {
  return suggestions.map((suggestion) => ({
    give: suggestion.give,
    receive: suggestion.receive
  }));
}
