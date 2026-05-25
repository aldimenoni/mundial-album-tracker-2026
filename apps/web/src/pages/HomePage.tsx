import { motion } from "framer-motion";
import { Repeat2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { CompareAlbumDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { CompareResult } from "../components/CompareResult";
import type { ExchangeSelection } from "../components/ExchangeOptionList";
import { AlertBanner, EmptyState } from "../components/ui/Badges";
import { ExchangePageSkeleton } from "../components/ui/Skeleton";
import { useQuery } from "../hooks/useQuery";
import { fadeUpItem, staggerContainer } from "../lib/motion-presets";
import { invalidateQueriesByPrefix } from "../lib/query-cache";
import { useRequiredUser } from "../state/user-store";
import { notifyAlbumUpdated } from "../utils/album-events";

function sortComparisonsByExchangeAvailability(comparisons: CompareAlbumDto[]): CompareAlbumDto[] {
  return [...comparisons].sort((left, right) => {
    const leftCount = left.suggestions.length;
    const rightCount = right.suggestions.length;
    const leftHasExchange = leftCount > 0;
    const rightHasExchange = rightCount > 0;

    if (leftHasExchange !== rightHasExchange) {
      return leftHasExchange ? -1 : 1;
    }

    if (leftCount !== rightCount) {
      return rightCount - leftCount;
    }

    return left.otherUser.name.localeCompare(right.otherUser.name, "es");
  });
}

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
  const sortedComparisons = useMemo(
    () => sortComparisonsByExchangeAvailability(comparisons ?? []),
    [comparisons]
  );

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
      invalidateQueriesByPrefix(`summary:${currentUser.id}`);
      invalidateQueriesByPrefix(`summary:${comparison.otherUser.id}`);
      await loadPageData();
    } catch (executeError: unknown) {
      setErrorMessage(getErrorMessage(executeError));
    } finally {
      setExecutingUserId(null);
      setExecutingOptionKey(null);
    }
  }

  return (
    <section className="grid gap-4">
      {error ? <AlertBanner>{getErrorMessage(error)}</AlertBanner> : null}
      {errorMessage ? <AlertBanner>{errorMessage}</AlertBanner> : null}
      {successMessage ? <AlertBanner tone="success">{successMessage}</AlertBanner> : null}
      {isFetching && comparisons ? <p className="fetching-indicator">Actualizando...</p> : null}
      {isLoading && !comparisons ? <ExchangePageSkeleton /> : null}

      {!isLoading && comparisons && comparisons.length === 0 ? (
        <EmptyState
          title="Sin intercambios todavía"
          description="Creá otro usuario y empezá a armar trades épicos."
          icon={<Repeat2 size={28} />}
        />
      ) : null}

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4"
      >
        {sortedComparisons.map((comparison) => (
          <motion.div key={comparison.otherUser.id} variants={fadeUpItem}>
            <CompareResult
              result={comparison}
              isExecuting={executingUserId === comparison.otherUser.id}
              executingOptionKey={executingOptionKey}
              onExecuteExchange={(nextComparison, selection, optionKey) =>
                void handleExecuteExchange(nextComparison, selection, optionKey)
              }
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
