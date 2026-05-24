import { useCallback, useEffect, useState } from "react";
import type { AlbumDto, UpdateUserStickerPayload } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";

export function useAlbumData(userId: string) {
  const [album, setAlbum] = useState<AlbumDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAlbum = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextAlbum = await api.getAlbum(userId);
      setAlbum(nextAlbum);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadAlbum();
  }, [loadAlbum]);

  const updateSticker = useCallback(
    async (stickerId: string, payload: UpdateUserStickerPayload) => {
      const updated = await api.updateAlbumSticker(userId, stickerId, payload);

      setAlbum((currentAlbum) =>
        currentAlbum
          ? {
              ...currentAlbum,
              stickers: currentAlbum.stickers.map((item) =>
                item.stickerId === stickerId ? updated : item
              )
            }
          : currentAlbum
      );
    },
    [userId]
  );

  return {
    album,
    isLoading,
    errorMessage,
    reload: loadAlbum,
    updateSticker
  };
}
