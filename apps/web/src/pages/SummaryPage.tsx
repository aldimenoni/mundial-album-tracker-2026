import { useCallback, useEffect, useState } from "react";
import type { AlbumSummaryDto, UserStickerDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { AlbumSummaryCard } from "../components/AlbumSummaryCard";
import { RepeatedStickersModal } from "../components/RepeatedStickersModal";
import { useRequiredUser } from "../state/user-store";
import { subscribeAlbumUpdated } from "../utils/album-events";

export function SummaryPage() {
  const currentUser = useRequiredUser();
  const [summary, setSummary] = useState<AlbumSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [repeatedModalOpen, setRepeatedModalOpen] = useState(false);
  const [repeatedStickers, setRepeatedStickers] = useState<UserStickerDto[]>([]);
  const [isLoadingRepeated, setIsLoadingRepeated] = useState(false);
  const [repeatedErrorMessage, setRepeatedErrorMessage] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextSummary = await api.getAlbumSummary(currentUser.id);
      setSummary(nextSummary);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => subscribeAlbumUpdated(currentUser.id, () => void loadSummary()), [currentUser.id, loadSummary]);

  async function openRepeatedModal(): Promise<void> {
    setRepeatedModalOpen(true);
    setIsLoadingRepeated(true);
    setRepeatedErrorMessage(null);

    try {
      const album = await api.getAlbum(currentUser.id);
      setRepeatedStickers(album.stickers.filter((item) => item.quantityRepeated > 0));
    } catch (error: unknown) {
      setRepeatedErrorMessage(getErrorMessage(error));
      setRepeatedStickers([]);
    } finally {
      setIsLoadingRepeated(false);
    }
  }

  function closeRepeatedModal(): void {
    setRepeatedModalOpen(false);
  }

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Home</p>
        <h2>Resumen</h2>
      </div>

      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {repeatedErrorMessage && repeatedModalOpen ? (
        <p className="alert">{repeatedErrorMessage}</p>
      ) : null}
      {isLoading ? <p className="empty-state">Calculando resumen...</p> : null}
      {summary ? (
        <AlbumSummaryCard summary={summary} onRepeatedClick={() => void openRepeatedModal()} />
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
