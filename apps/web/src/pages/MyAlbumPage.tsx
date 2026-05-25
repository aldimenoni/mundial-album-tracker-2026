import { AlbumSpreadViewer } from "../components/AlbumSpreadViewer";
import { AlbumPageSkeleton } from "../components/ui/Skeleton";
import { useRequiredUser } from "../state/user-store";
import { useAlbumData } from "./use-album-data";

export function MyAlbumPage() {
  const currentUser = useRequiredUser();
  const { album, isLoading, isFetching, errorMessage, updateSticker } = useAlbumData(currentUser.id);

  return (
    <section className="stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Mi album</p>
          <h2>{currentUser.name}</h2>
          <p>Recorre el album Panini cuadro por cuadro, como en el libro fisico.</p>
          {isFetching && album ? <p className="fetching-indicator">Actualizando...</p> : null}
        </div>
      </div>

      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {isLoading ? <AlbumPageSkeleton /> : null}
      {album ? (
        <AlbumSpreadViewer stickers={album.stickers} editable onUpdate={updateSticker} />
      ) : null}
    </section>
  );
}
