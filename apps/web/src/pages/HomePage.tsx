import { useCallback, useEffect, useMemo, useState } from "react";
import type { CompareAlbumDto, PendingSettlementDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { CompareResult } from "../components/CompareResult";
import { PendingSettlementCard } from "../components/PendingSettlementCard";
import type { ExchangeSelection } from "../components/ExchangeOptionList";
import { useRequiredUser } from "../state/user-store";
import { notifyAlbumUpdated } from "../utils/album-events";

export function HomePage() {
  const currentUser = useRequiredUser();
  const [comparisons, setComparisons] = useState<CompareAlbumDto[]>([]);
  const [pendingSettlements, setPendingSettlements] = useState<PendingSettlementDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [executingUserId, setExecutingUserId] = useState<string | null>(null);
  const [executingOptionKey, setExecutingOptionKey] = useState<string | null>(null);
  const [finalizingProposalId, setFinalizingProposalId] = useState<string | null>(null);
  const [finalizingOptionKey, setFinalizingOptionKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPageData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const users = await api.listUsers();
      const otherUsers = users.filter((user) => user.id !== currentUser.id);
      const [results, settlements] = await Promise.all([
        Promise.all(otherUsers.map((user) => api.compareAlbums(currentUser.id, user.id))),
        api.listPendingSettlements(currentUser.id)
      ]);

      setComparisons(results);
      setPendingSettlements(settlements);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  const pendingUserIds = useMemo(
    () => new Set(pendingSettlements.map((settlement) => settlement.otherUser.id)),
    [pendingSettlements]
  );

  const visibleComparisons = useMemo(
    () => comparisons.filter((comparison) => !pendingUserIds.has(comparison.otherUser.id)),
    [comparisons, pendingUserIds]
  );

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
            : comparison.message,
        ...(optionKey === "custom" ? { custom: true } : {}),
        ...(optionKey === "all"
          ? {}
          : {
              stickersGivenByMe: selection.stickersGivenByMe,
              stickersGivenByOther: selection.stickersGivenByOther
            })
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

  async function handleFinalizeSettlement(
    settlement: PendingSettlementDto,
    selection: ExchangeSelection,
    optionKey: string
  ): Promise<void> {
    setErrorMessage(null);
    setSuccessMessage(null);
    setFinalizingProposalId(settlement.proposal.id);
    setFinalizingOptionKey(optionKey);

    try {
      const exchangeResult = await api.finalizeExchange(
        settlement.proposal.id,
        currentUser.id,
        optionKey === "all" ? undefined : selection
      );

      notifyAlbumUpdated(exchangeResult.fromUserSummary.user.id, exchangeResult.toUserSummary.user.id);
      setSuccessMessage(exchangeResult.message);
      await loadPageData();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setFinalizingProposalId(null);
      setFinalizingOptionKey(null);
    }
  }

  return (
    <div className="stack">
      <div className="page-heading">
        <p className="eyebrow">Intercambio</p>
        <h2>Intercambios</h2>
        <p>Oportunidades de cambio con todos los albumes cargados.</p>
      </div>

      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {successMessage ? <p className="success-banner">{successMessage}</p> : null}
      {isLoading ? <p className="empty-state">Calculando intercambios...</p> : null}

      {!isLoading && pendingSettlements.length > 0 ? (
        <section className="stack pending-settlement-section">
          <div className="section-heading">
            <h3>Pendientes de saldo</h3>
            <p>Intercambios parciales que todavía tienen figuritas por cerrar.</p>
          </div>
          <div className="trade-overview-list">
            {pendingSettlements.map((settlement) => (
              <PendingSettlementCard
                key={settlement.proposal.id}
                settlement={settlement}
                isFinalizing={finalizingProposalId === settlement.proposal.id}
                finalizingOptionKey={finalizingOptionKey}
                onFinalizeOne={(nextSettlement, selection, optionKey) =>
                  void handleFinalizeSettlement(nextSettlement, selection, optionKey)
                }
                onFinalizeAll={(nextSettlement, selection) =>
                  void handleFinalizeSettlement(nextSettlement, selection, "all")
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {!isLoading && comparisons.length === 0 ? (
        <p className="empty-state">Creá otro usuario para ver posibles intercambios.</p>
      ) : null}

      {!isLoading && comparisons.length > 0 && visibleComparisons.length === 0 ? (
        <p className="empty-state">
          {pendingSettlements.length > 0
            ? "No hay nuevas oportunidades abiertas. Revisá los pendientes de saldo."
            : "No hay intercambios visibles. Volvé a cargar la página para verlos de nuevo."}
        </p>
      ) : null}

      <div className="trade-overview-list">
        {visibleComparisons.map((comparison) => (
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
