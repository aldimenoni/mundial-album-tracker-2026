import { useEffect, useState } from "react";
import type { AlbumSummaryDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { AlbumSummaryCard } from "../components/AlbumSummaryCard";
import { useRequiredUser } from "../state/user-store";

export function SummaryPage() {
  const currentUser = useRequiredUser();
  const [summary, setSummary] = useState<AlbumSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary(): Promise<void> {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextSummary = await api.getAlbumSummary(currentUser.id);
        setSummary(nextSummary);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadSummary();
  }, [currentUser.id]);

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Estadisticas</p>
        <h2>Resumen</h2>
      </div>

      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {isLoading ? <p className="empty-state">Calculando resumen...</p> : null}
      {summary ? <AlbumSummaryCard summary={summary} /> : null}
    </section>
  );
}
