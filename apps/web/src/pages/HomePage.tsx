import { useCallback, useState } from "react";
import type { CompareAlbumDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { CompareResult } from "../components/CompareResult";
import type { ExchangeSelection } from "../components/ExchangeOptionList";
import { ExchangePageSkeleton } from "../components/ui/Skeleton";
import { useQuery } from "../hooks/useQuery";
import { invalidateQueriesByPrefix } from "../lib/query-cache";
import { useRequiredUser } from "../state/user-store";
import { notifyAlbumUpdated } from "../utils/album-events";

export function HomePage() {
  const currentUser = useRequiredUser();
  const {
    data: comparisons,
    error,
    isLoading,
    isFetching,
    refetch
  } = useQuery(
    `compare-list:${currentUser.id}`,
    () => api.listAlbumComparisons(currentUser.id),
    { staleTime: 30_000 }
  );
  const [executingUserId, setExecutingUserId] = useState<string | null>(null);
  const [executingOptionKey, setExecutingOptionKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPageData = useCallback(async () => {
    invalidateQueriesByPrefix(`compare-list:${currentUser.id}`);
    await refetch();
  }, [currentUser.id, refetch]);

  async function handleExecuteExchange(
    comparison: CompareAlbumDto,
    selection: ExchangeSelection,
    optionKey: string
  ): Promise<void> {
    setSuccessMessage(null);
    setErrorMessage(null);
    setExecutingUserId(comparison.otherUser.id);
    setExecutingOptionKey(optionKey);

    try {
      const exchangeResult = await api.executeExchange({
        fromUserId: currentUser.id,
        toUserId: comparison.otherUser.id,
        notes:
          optionKey === "custom"
            ? `Intercambio personalizado con @${comparison.otherUser.name}`
            : optionKey === "all"
              ? `${selection.stickersGivenByMe.length} intercambios uno a uno con @${comparison.otherUser.name}`
              : comparison.message,
        ...(optionKey === "custom" ? { custom: true } : {}),
        stickersGivenByMe: selection.stickersGivenByMe,
        stickersGivenByOther: selection.stickersGivenByOther
      });

      notifyAlbumUpdated(exchangeResult.fromUserSummary.user.id, exchangeResult.toUserSummary.user.id);
      setSuccessMessage(exchangeResult.message);
      await loadPageData();
    } catch (executeError: unknown) {
      setErrorMessage(getErrorMessage(executeError));
    } finally {
      setExecutingUserId(null);
      setExecutingOptionKey(null);
    }
  }

  return (
    <div className="stack">
      {error ? <p className="alert">{getErrorMessage(error)}</p> : null}
      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {successMessage ? <p className="success-banner">{successMessage}</p> : null}
      {isFetching && comparisons ? <p className="fetching-indicator">Actualizando...</p> : null}
      {isLoading && !comparisons ? <ExchangePageSkeleton /> : null}

      {!isLoading && comparisons && comparisons.length === 0 ? (
        <p className="empty-state">Creá otro usuario para ver posibles intercambios.</p>
      ) : null}

      <div className="trade-overview-list">
        {(comparisons ?? []).map((comparison) => (
          <CompareResult
            key={comparison.otherUser.id}
            result={comparison}
            isExecuting={executingUserId === comparison.otherUser.id}
            executingOptionKey={executingOptionKey}
            onExecuteExchange={(nextComparison, selection, optionKey) =>
              void handleExecuteExchange(nextComparison, selection, optionKey)
            }
          />
        ))}
      </div>
    </div>
  );
}
