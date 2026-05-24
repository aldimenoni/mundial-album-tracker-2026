import { useEffect, useMemo, useState } from "react";
import type { CompareAlbumDto, UserDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { CompareResult } from "../components/CompareResult";
import { useRequiredUser } from "../state/user-store";

export function CompareTradePage() {
  const currentUser = useRequiredUser();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [result, setResult] = useState<CompareAlbumDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const otherUsers = useMemo(
    () => users.filter((user) => user.id !== currentUser.id),
    [currentUser.id, users]
  );

  useEffect(() => {
    async function loadUsers(): Promise<void> {
      try {
        const nextUsers = await api.listUsers();
        setUsers(nextUsers);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
      }
    }

    void loadUsers();
  }, []);

  async function handleCompare(): Promise<void> {
    if (!selectedUserId) {
      return;
    }

    setErrorMessage(null);

    try {
      const comparison = await api.compareAlbums(currentUser.id, selectedUserId);
      setResult(comparison);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Intercambio</p>
        <h2>Comparar albumes</h2>
        <p>Calculá faltantes propios contra repetidas de otra persona.</p>
      </div>

      {errorMessage ? <p className="alert">{errorMessage}</p> : null}

      <div className="compare-controls">
        <label className="field">
          <span>Persona</span>
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.currentTarget.value)}
          >
            <option value="">Seleccionar</option>
            {otherUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="primary-button"
          type="button"
          disabled={!selectedUserId}
          onClick={() => void handleCompare()}
        >
          Comparar
        </button>
      </div>

      {result ? <CompareResult result={result} /> : null}
      {otherUsers.length === 0 ? (
        <p className="empty-state">Creá otro usuario para calcular intercambios.</p>
      ) : null}
    </section>
  );
}
