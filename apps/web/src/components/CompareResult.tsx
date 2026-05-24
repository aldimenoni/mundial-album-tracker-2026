import type { CompareAlbumDto } from "@mundial-album/shared";
import { EXCHANGE_TYPE_LABELS } from "@mundial-album/shared";
import { CustomExchangePanel } from "./CustomExchangePanel";
import {
  ExchangeOptionList,
  suggestionsToOptions,
  type ExchangeSelection
} from "./ExchangeOptionList";

function canShowCustomExchange(result: CompareAlbumDto): boolean {
  return result.myRepeatedStickers.length > 0 || result.otherRepeatedStickers.length > 0;
}

export function CompareResult({
  result,
  onExecuteExchange,
  isExecuting = false,
  executingOptionKey = null
}: {
  result: CompareAlbumDto;
  onExecuteExchange?: (
    result: CompareAlbumDto,
    selection: ExchangeSelection,
    optionKey: string
  ) => void;
  isExecuting?: boolean;
  executingOptionKey?: string | null;
}) {
  const showCustomExchange = canShowCustomExchange(result);
  const options = suggestionsToOptions(result.suggestions);
  const pairCount = options.length;
  const canExecuteSuggested = Boolean(onExecuteExchange) && options.length > 0;

  return (
    <section className="compare-result">
      <div className="compare-result-header">
        <h3>@{result.otherUser.name}</h3>
        {pairCount > 0 ? (
          <>
            <span className={`exchange-type-badge exchange-type-${result.type.toLowerCase()}`}>
              {EXCHANGE_TYPE_LABELS[result.type]}
            </span>
            <p className="exchange-totals-line">
              {pairCount === 1
                ? "1 cambio uno a uno disponible"
                : `${pairCount} cambios uno a uno disponibles`}
            </p>
          </>
        ) : null}
      </div>

      {pairCount > 0 ? (
        <ExchangeOptionList
          options={options}
          isBusy={isExecuting && executingOptionKey !== "custom"}
          busyOptionKey={executingOptionKey}
          {...(canExecuteSuggested && onExecuteExchange
            ? {
                onConfirmOne: (selection, optionKey) =>
                  onExecuteExchange(result, selection, optionKey),
                ...(pairCount > 1
                  ? {
                      onConfirmAll: (selection) =>
                        onExecuteExchange(result, selection, "all"),
                      confirmAllLabel: `Intercambiar todas (${pairCount})`
                    }
                  : {})
              }
            : {})}
        />
      ) : (
        <p className="exchange-message">{result.message}</p>
      )}

      {showCustomExchange ? (
        <CustomExchangePanel
          myRepeatedStickers={result.myRepeatedStickers}
          otherRepeatedStickers={result.otherRepeatedStickers}
          otherUserName={result.otherUser.name}
          isBusy={isExecuting}
          isBusyCustom={isExecuting && executingOptionKey === "custom"}
          {...(onExecuteExchange
            ? {
                onConfirm: (selection) => onExecuteExchange(result, selection, "custom")
              }
            : {})}
        />
      ) : null}
    </section>
  );
}
