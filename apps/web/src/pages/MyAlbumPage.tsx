import { AlbumSpreadViewer } from "../components/AlbumSpreadViewer";
import { useRequiredUser } from "../state/user-store";
import { useAlbumData } from "./use-album-data";

export function MyAlbumPage() {
  const currentUser = useRequiredUser();
  const { album, isLoading, errorMessage, updateSticker } = useAlbumData(currentUser.id);

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Mi album</p>
        <h2>{currentUser.name}</h2>
        <p>Recorre el album Panini cuadro por cuadro, como en el libro fisico.</p>
      </div>

      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {isLoading ? <p className="empty-state">Cargando album...</p> : null}
      {album ? (
        <AlbumSpreadViewer stickers={album.stickers} editable onUpdate={updateSticker} />
      ) : null}
    </section>
  );
}
