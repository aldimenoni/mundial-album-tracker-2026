import { FormEvent, useEffect, useState } from "react";
import type { UserDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { useUser } from "../state/user-store";

export function UserSelectionPage() {
  const { currentUser, setCurrentUser } = useUser();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadUsers(): Promise<void> {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextUsers = await api.listUsers();
      setUsers(nextUsers);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const user = await api.createUser({ name, email });
      setCurrentUser(user);
      setName("");
      setEmail("");
      await loadUsers();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="two-column">
      <section className="work-panel">
        <div className="page-heading">
          <p className="eyebrow">Usuario activo</p>
          <h2>{currentUser ? currentUser.name : "Crear usuario"}</h2>
          <p>{currentUser ? currentUser.email : "Cada usuario tiene su álbum personal."}</p>
        </div>

        {errorMessage ? <p className="alert">{errorMessage}</p> : null}

        <form className="form-grid" onSubmit={(event) => void handleSubmit(event)}>
          <label className="field">
            <span>Nombre</span>
            <input value={name} onChange={(event) => setName(event.currentTarget.value)} />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
          </label>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            Crear usuario
          </button>
        </form>
      </section>

      <section className="work-panel">
        <div className="page-heading">
          <p className="eyebrow">Usuarios</p>
          <h2>Seleccionar</h2>
        </div>

        {isLoading ? <p className="empty-state">Cargando usuarios...</p> : null}
        <div className="user-list">
          {users.map((user) => (
            <button
              key={user.id}
              className={currentUser?.id === user.id ? "selected-list-button" : "list-button"}
              type="button"
              onClick={() => setCurrentUser(user)}
            >
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
