import { useState } from "react";
import type { AlbumSummaryDto, UserStickerDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { AlbumSummaryCard } from "../components/AlbumSummaryCard";
import { LegendaryMedalsSection } from "../components/LegendaryMedalsSection";
import { RepeatedStickersModal } from "../components/RepeatedStickersModal";
import { SpreadProgressList } from "../components/SpreadProgressList";
import { AlertBanner } from "../components/ui/Badges";
import { SummaryPageSkeleton } from "../components/ui/Skeleton";
import { useQuery } from "../hooks/useQuery";
import { useRequiredUser } from "../state/user-store";

export function SummaryPage() {
  const currentUser = useRequiredUser();
  const { data: summary, error, isLoading, isFetching } = useQuery(
    `summary:${currentUser.id}`,
    () => api.getAlbumSummary(currentUser.id),
    { staleTime: 30_000 }
  );
  const [repeatedModalOpen, setRepeatedModalOpen] = useState(false);
  const [repeatedStickers, setRepeatedStickers] = useState<UserStickerDto[]>([]);
  const [isLoadingRepeated, setIsLoadingRepeated] = useState(false);
  const [repeatedErrorMessage, setRepeatedErrorMessage] = useState<string | null>(null);

  async function openRepeatedModal(): Promise<void> {
    setRepeatedModalOpen(true);
    setIsLoadingRepeated(true);
    setRepeatedErrorMessage(null);

    try {
      const album = await api.getAlbum(currentUser.id);
      setRepeatedStickers(album.stickers.filter((item) => item.quantityRepeated > 0));
    } catch (loadError: unknown) {
      setRepeatedErrorMessage(getErrorMessage(loadError));
      setRepeatedStickers([]);
    } finally {
      setIsLoadingRepeated(false);
    }
  }

  function closeRepeatedModal(): void {
    setRepeatedModalOpen(false);
  }

  return (
    <section className="grid gap-4">
      {error ? <AlertBanner>{getErrorMessage(error)}</AlertBanner> : null}
      {repeatedErrorMessage && repeatedModalOpen ? (
        <AlertBanner>{repeatedErrorMessage}</AlertBanner>
      ) : null}
      {isFetching && summary ? <p className="fetching-indicator">Actualizando...</p> : null}
      {isLoading && !summary ? <SummaryPageSkeleton /> : null}
      {summary ? (
        <>
          <AlbumSummaryCard summary={summary} onRepeatedClick={() => void openRepeatedModal()} />
          <LegendaryMedalsSection medals={summary.legendaryMedals} />
          <SpreadProgressList spreads={summary.spreadProgress} />
        </>
      ) : null}

      <RepeatedStickersModal
        isOpen={repeatedModalOpen}
        isLoading={isLoadingRepeated}
        stickers={repeatedStickers}
        onClose={closeRepeatedModal}
      />
    </section>
  );
}
