import type { CompareAlbumDto } from "@mundial-album/shared";
import { EXCHANGE_TYPE_LABELS } from "@mundial-album/shared";
import { CustomExchangePanel } from "./CustomExchangePanel";
import {
  ExchangeOptionList,
  suggestionsToOptions,
  type ExchangeSelection
} from "./ExchangeOptionList";

function hasExchangeContent(result: CompareAlbumDto): boolean {
  return result.type !== "NOT_AVAILABLE";
}

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
  const showExchange = hasExchangeContent(result);
  const showCustomExchange = canShowCustomExchange(result);
  const options = suggestionsToOptions(result.suggestions);
  const giveCount = result.canGive.length;
  const receiveCount = result.canReceive.length;
  const canExecuteSuggested =
    Boolean(onExecuteExchange) &&
    result.type !== "NOT_AVAILABLE" &&
    result.type !== "INFO_INSUFFICIENT" &&
    options.length > 0;

  return (
    <section className="compare-result">
      <div className="compare-result-header">
        <h3>@{result.otherUser.name}</h3>
        {showExchange ? (
          <>
            <span className={`exchange-type-badge exchange-type-${result.type.toLowerCase()}`}>
              {EXCHANGE_TYPE_LABELS[result.type]}
            </span>
            {giveCount > 0 || receiveCount > 0 ? (
              <p className="exchange-totals-line">
                Das {giveCount} · Recibís {receiveCount}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      {showExchange ? (
        <>
          {result.pendingCountForMe > 0 || result.pendingCountForOther > 0 ? (
            <div className="exchange-balance-banner">
              {result.pendingCountForMe > 0
                ? `@${result.otherUser.name} te debería ${result.pendingCountForMe} figurita${result.pendingCountForMe === 1 ? "" : "s"} pendiente${result.pendingCountForMe === 1 ? "" : "s"}.`
                : `Te quedan ${result.pendingCountForOther} figurita${result.pendingCountForOther === 1 ? "" : "s"} pendiente${result.pendingCountForOther === 1 ? "" : "s"} a favor de @${result.otherUser.name}.`}
            </div>
          ) : null}

          {result.message && options.length === 0 ? (
            <p className="exchange-message">{result.message}</p>
          ) : null}

          {canExecuteSuggested || options.length > 0 ? (
            <ExchangeOptionList
              options={options}
              isBusy={isExecuting && executingOptionKey !== "custom"}
              busyOptionKey={executingOptionKey}
              confirmAllLabel={result.type === "PENDING" ? "Dar todas" : "Intercambiar todas"}
              busyAllLabel={result.type === "PENDING" ? "Entregando..." : "Intercambiando todas..."}
              {...(canExecuteSuggested && onExecuteExchange
                ? {
                    onConfirmOne: (selection, optionKey) =>
                      onExecuteExchange(result, selection, optionKey),
                    onConfirmAll: (selection) => onExecuteExchange(result, selection, "all")
                  }
                : {})}
            />
          ) : null}
        </>
      ) : (
        <p className="empty-state">{result.message}</p>
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
