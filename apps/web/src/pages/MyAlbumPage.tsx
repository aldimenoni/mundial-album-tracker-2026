import { motion } from "framer-motion";
import { AlbumSpreadViewer } from "../components/AlbumSpreadViewer";
import { AppCard } from "../components/ui/AppCard";
import { AnimatedProgress } from "../components/ui/AnimatedProgress";
import { AlertBanner } from "../components/ui/Badges";
import { AlbumPageSkeleton } from "../components/ui/Skeleton";
import { useRequiredUser } from "../state/user-store";
import { formatCompletionPercent } from "../lib/format-percent";
import { useAlbumData } from "./use-album-data";

export function MyAlbumPage() {
  const currentUser = useRequiredUser();
  const { album, isLoading, isFetching, errorMessage, updateSticker } = useAlbumData(currentUser.id);

  const completion = album
    ? formatCompletionPercent(
        album.stickers.length > 0
          ? (album.stickers.filter((item) => item.status === "owned" || item.status === "repeated")
              .length /
              album.stickers.length) *
              100
          : 0
      )
    : 0;

  return (
    <section className="grid gap-4">
      <AppCard className="p-4">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-panini-gold">
          Mi álbum
        </p>
        <h2 className="mt-1 text-2xl font-black text-white">@{currentUser.name}</h2>
        <p className="mt-1 text-sm font-medium text-white/60">
          Recorré el álbum Panini cuadro por cuadro, como en el libro físico.
        </p>
        {album ? (
          <div className="mt-4">
            <AnimatedProgress value={completion} showLabel />
          </div>
        ) : null}
        {isFetching && album ? <p className="fetching-indicator mt-2">Actualizando...</p> : null}
      </AppCard>

      {errorMessage ? <AlertBanner>{errorMessage}</AlertBanner> : null}
      {isLoading ? <AlbumPageSkeleton /> : null}
      {album ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <AlbumSpreadViewer stickers={album.stickers} editable onUpdate={updateSticker} />
        </motion.div>
      ) : null}
    </section>
  );
}
