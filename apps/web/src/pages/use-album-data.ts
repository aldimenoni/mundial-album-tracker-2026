import { useCallback, useEffect, useState } from "react";
import type { AlbumDto, UpdateUserStickerPayload } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { useQuery } from "../hooks/useQuery";
import { invalidateQuery } from "../lib/query-cache";

export function useAlbumData(userId: string) {
  const { data, error, isLoading, isFetching, refetch } = useQuery(
    `album:${userId}`,
    () => api.getAlbum(userId),
    { staleTime: 30_000 }
  );
  const [album, setAlbum] = useState<AlbumDto | null>(null);

  useEffect(() => {
    if (data) {
      setAlbum(data);
    }
  }, [data]);

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
      invalidateQuery(`summary:${userId}`);
    },
    [userId]
  );

  return {
    album,
    isLoading: isLoading && !album,
    isFetching,
    errorMessage: error ? getErrorMessage(error) : null,
    reload: refetch,
    updateSticker
  };
}
