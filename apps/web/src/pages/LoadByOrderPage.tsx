import { StickerGrid } from "../components/StickerGrid";
import { useRequiredUser } from "../state/user-store";
import { useAlbumData } from "./use-album-data";

export function LoadByOrderPage() {
  const currentUser = useRequiredUser();
  const { album, isLoading, errorMessage, updateSticker } = useAlbumData(currentUser.id);

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Carga rapida</p>
        <h2>Por orden de album</h2>
        <p>Recorré la lista por índice y marcá propias o repetidas.</p>
      </div>

      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {isLoading ? <p className="empty-state">Cargando figuritas...</p> : null}
      {album ? (
        <StickerGrid items={album.stickers} editable compact onUpdate={updateSticker} />
      ) : null}
    </section>
  );
}
