import { invalidateAlbumQueries } from "../lib/query-cache";

export const ALBUM_UPDATED_EVENT = "mundial-album-updated";

export function notifyAlbumUpdated(...userIds: string[]): void {
  for (const userId of userIds) {
    invalidateAlbumQueries(userId);

    window.dispatchEvent(
      new CustomEvent(ALBUM_UPDATED_EVENT, {
        detail: { userId }
      })
    );
  }
}

export function subscribeAlbumUpdated(
  userId: string,
  listener: () => void
): () => void {
  function handleEvent(event: Event): void {
    const detail = (event as CustomEvent<{ userId: string }>).detail;

    if (detail.userId === userId) {
      listener();
    }
  }

  window.addEventListener(ALBUM_UPDATED_EVENT, handleEvent);

  return () => {
    window.removeEventListener(ALBUM_UPDATED_EVENT, handleEvent);
  };
}
