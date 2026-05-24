import { StickerGrid } from "../components/StickerGrid";
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
        <p>Vista completa con estado por figurita.</p>
      </div>

      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {isLoading ? <p className="empty-state">Cargando album...</p> : null}
      {album ? <StickerGrid items={album.stickers} editable onUpdate={updateSticker} /> : null}
    </section>
  );
}
