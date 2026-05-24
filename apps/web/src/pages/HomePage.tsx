import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AlbumSummaryDto } from "@mundial-album/shared";
import { AlbumSummaryCard } from "../components/AlbumSummaryCard";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { useUser } from "../state/user-store";

export function HomePage() {
  const { currentUser } = useUser();
  const [summary, setSummary] = useState<AlbumSummaryDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const userId = currentUser?.id;

    if (!userId) {
      setSummary(null);
      return;
    }

    async function loadSummary(selectedUserId: string): Promise<void> {
      try {
        const nextSummary = await api.getAlbumSummary(selectedUserId);
        setSummary(nextSummary);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
      }
    }

    void loadSummary(userId);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <section className="work-panel">
        <div className="page-heading">
          <p className="eyebrow">Empezar</p>
          <h2>Elegir usuario</h2>
          <p>Creá o seleccioná un usuario para cargar tu álbum personal.</p>
        </div>
        <Link className="primary-link" to="/usuarios">
          Ir a usuarios
        </Link>
      </section>
    );
  }

  return (
    <div className="stack">
      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {summary ? <AlbumSummaryCard summary={summary} /> : null}

      <section className="quick-actions">
        <Link to="/cargar-orden">Cargar por orden</Link>
        <Link to="/cargar-equipo">Cargar por equipo</Link>
        <Link to="/comparar">Comparar para intercambiar</Link>
      </section>
    </div>
  );
}
