import { useEffect, useMemo, useState } from "react";
import type { AlbumDto, UserDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { StickerGrid } from "../components/StickerGrid";
import { useRequiredUser } from "../state/user-store";

export function ExploreAlbumsPage() {
  const currentUser = useRequiredUser();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [album, setAlbum] = useState<AlbumDto | null>(null);
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

  useEffect(() => {
    if (!selectedUserId) {
      setAlbum(null);
      return;
    }

    async function loadAlbum(): Promise<void> {
      try {
        const nextAlbum = await api.getAlbum(selectedUserId);
        setAlbum(nextAlbum);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
      }
    }

    void loadAlbum();
  }, [selectedUserId]);

  return (
    <div className="two-column wide-left">
      <section className="work-panel">
        <div className="page-heading">
          <p className="eyebrow">Otros albumes</p>
          <h2>Explorar</h2>
        </div>

        {errorMessage ? <p className="alert">{errorMessage}</p> : null}

        <div className="user-list">
          {otherUsers.map((user) => (
            <button
              key={user.id}
              className={selectedUserId === user.id ? "selected-list-button" : "list-button"}
              type="button"
              onClick={() => setSelectedUserId(user.id)}
            >
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </button>
          ))}
        </div>
        {otherUsers.length === 0 ? (
          <p className="empty-state">Creá otro usuario para explorar álbumes.</p>
        ) : null}
      </section>

      <section className="stack">
        <div className="page-heading">
          <p className="eyebrow">Album consultado</p>
          <h2>{album ? album.user.name : "Seleccionar usuario"}</h2>
        </div>
        {album ? (
          <StickerGrid items={album.stickers} compact />
        ) : (
          <p className="empty-state">Elegí una persona para ver sus figuritas.</p>
        )}
      </section>
    </div>
  );
}
