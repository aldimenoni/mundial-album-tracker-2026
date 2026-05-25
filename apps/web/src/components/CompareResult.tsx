import type { CompareAlbumDto } from "@mundial-album/shared";
import { AppCard } from "./ui/AppCard";
import { UserAvatar } from "./ui/Badges";
import { CustomExchangePanel } from "./CustomExchangePanel";
import {
  ExchangeOptionList,
  suggestionsToOptions,
  type ExchangeSelection
} from "./ExchangeOptionList";

function canShowCustomExchange(result: CompareAlbumDto, pairCount: number): boolean {
  if (pairCount === 0) {
    return false;
  }

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
  const options = suggestionsToOptions(result.suggestions);
  const pairCount = options.length;
  const showCustomExchange = canShowCustomExchange(result, pairCount);
  const canExecuteSuggested = Boolean(onExecuteExchange) && options.length > 0;
  const hasBody = pairCount > 0 || showCustomExchange;

  return (
    <AppCard className="p-0">
      <div className="border-b border-white/10 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar name={result.otherUser.name} size="md" />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-white">@{result.otherUser.name}</h3>
            {pairCount > 0 ? (
              <p className="mt-1 text-sm font-semibold text-white/65">
                {pairCount === 1
                  ? "1 intercambio disponible"
                  : `${pairCount} intercambios disponibles`}
              </p>
            ) : (
              <p className="mt-1 text-sm font-semibold text-white/65">{result.message}</p>
            )}
          </div>
        </div>
      </div>

      {hasBody ? (
        <div className="grid gap-3 p-3">
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
          ) : null}

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
        </div>
      ) : null}
    </AppCard>
  );
}
