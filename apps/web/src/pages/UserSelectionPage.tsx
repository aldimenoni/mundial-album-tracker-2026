import { FormEvent, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UserDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { UserListSkeleton } from "../components/ui/Skeleton";
import { useQuery } from "../hooks/useQuery";
import { invalidateQuery } from "../lib/query-cache";
import { useUser } from "../state/user-store";

export function UserSelectionPage() {
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();
  const {
    data: users = [],
    error,
    isLoading,
    refetch
  } = useQuery("users", () => api.listUsers(), { staleTime: 30_000 });
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function closeCreateForm(): void {
    setShowCreateForm(false);
    setNickname("");
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.createUser({ name: nickname });
      setNickname("");
      setShowCreateForm(false);
      invalidateQuery("users");
      await refetch();
    } catch (submitError: unknown) {
      setErrorMessage(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="work-panel user-selection-panel">
      <div className="page-heading page-heading-toolbar">
        <div>
          <p className="eyebrow">Acceso</p>
          <h2>Usuarios</h2>
          <p>Elegí un usuario para ingresar a tu álbum.</p>
        </div>
        {!showCreateForm ? (
          <button
            className="icon-button"
            type="button"
            aria-label="Crear usuario"
            title="Crear usuario"
            onClick={() => setShowCreateForm(true)}
          >
            <UserPlus size={20} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {error ? <p className="alert">{getErrorMessage(error)}</p> : null}
      {errorMessage ? <p className="alert">{errorMessage}</p> : null}

      {showCreateForm ? (
        <form className="form-grid create-user-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid-header">
            <h3>Nuevo usuario</h3>
            <button
              className="icon-button icon-button-ghost"
              type="button"
              aria-label="Cerrar formulario"
              onClick={closeCreateForm}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <label className="field">
            <span>Nickname</span>
            <input
              value={nickname}
              autoComplete="username"
              autoFocus
              placeholder="aldimenoni"
              onChange={(event) => setNickname(event.currentTarget.value)}
            />
          </label>
          <div className="form-actions">
            <button className="ghost-button" type="button" onClick={closeCreateForm}>
              Cancelar
            </button>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              Crear usuario
            </button>
          </div>
        </form>
      ) : null}

      {isLoading && users.length === 0 ? <UserListSkeleton /> : null}

      {!isLoading && users.length === 0 ? (
        <p className="empty-state">Todavía no hay usuarios. Creá el primero con el botón +.</p>
      ) : null}

      <div className="user-list">
        {users.map((user: UserDto) => {
          const isActive = currentUser?.id === user.id;

          return (
            <div
              key={user.id}
              className={isActive ? "user-list-item is-active" : "user-list-item"}
            >
              <strong>@{user.name}</strong>
              <button
                className={isActive ? "ghost-button" : "primary-button"}
                type="button"
                disabled={isActive}
                onClick={() => {
                  setCurrentUser(user);
                  navigate("/");
                }}
              >
                {isActive ? "Activo" : "Ingresar"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
