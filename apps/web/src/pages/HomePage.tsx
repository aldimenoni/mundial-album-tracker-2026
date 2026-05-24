import { useCallback, useEffect, useState } from "react";
import type { CompareAlbumDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { CompareResult } from "../components/CompareResult";
import type { ExchangeSelection } from "../components/ExchangeOptionList";
import { useRequiredUser } from "../state/user-store";
import { notifyAlbumUpdated } from "../utils/album-events";

export function HomePage() {
  const currentUser = useRequiredUser();
  const [comparisons, setComparisons] = useState<CompareAlbumDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [executingUserId, setExecutingUserId] = useState<string | null>(null);
  const [executingOptionKey, setExecutingOptionKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPageData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const users = await api.listUsers();
      const otherUsers = users.filter((user) => user.id !== currentUser.id);
      const results = await Promise.all(
        otherUsers.map((user) => api.compareAlbums(currentUser.id, user.id))
      );

      setComparisons(results);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  async function handleExecuteExchange(
    comparison: CompareAlbumDto,
    selection: ExchangeSelection,
    optionKey: string
  ): Promise<void> {
    setErrorMessage(null);
    setSuccessMessage(null);
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
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setExecutingUserId(null);
      setExecutingOptionKey(null);
    }
  }

  return (
    <div className="stack">
      <div className="page-heading">
        <p className="eyebrow">Intercambio</p>
        <h2>Intercambios</h2>
        <p>Intercambios uno a uno sugeridos o personalizados con cada usuario.</p>
      </div>

      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {successMessage ? <p className="success-banner">{successMessage}</p> : null}
      {isLoading ? <p className="empty-state">Calculando intercambios...</p> : null}

      {!isLoading && comparisons.length === 0 ? (
        <p className="empty-state">Creá otro usuario para ver posibles intercambios.</p>
      ) : null}

      <div className="trade-overview-list">
        {comparisons.map((comparison) => (
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
