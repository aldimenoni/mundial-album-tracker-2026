type AlbumStickerRecord = {
  id: string | null;
  quantityOwned: number;
  quantityRepeated: number;
};

export interface CompareAlbumUserStatus {
  albumLoaded: boolean;
  hasMissingTracked: boolean;
  hasRepeatedStickers: boolean;
}

const EMPTY_ALBUM_STATUS: CompareAlbumUserStatus = {
  albumLoaded: false,
  hasMissingTracked: false,
  hasRepeatedStickers: false
};

export function albumHasTrackedData(stickers: AlbumStickerRecord[]): boolean {
  return stickers.some((item) => item.id !== null);
}

export function albumHasMissingTrackedData(stickers: AlbumStickerRecord[]): boolean {
  return stickers.some((item) => item.id !== null && item.quantityOwned === 0);
}

export function albumHasRepeatedStickers(stickers: AlbumStickerRecord[]): boolean {
  return stickers.some((item) => item.quantityRepeated > 0);
}

export function buildAlbumUserStatus(stickers: AlbumStickerRecord[]): CompareAlbumUserStatus {
  return {
    albumLoaded: albumHasTrackedData(stickers),
    hasMissingTracked: albumHasMissingTrackedData(stickers),
    hasRepeatedStickers: albumHasRepeatedStickers(stickers)
  };
}

export function resolveAlbumStatus(status?: CompareAlbumUserStatus): CompareAlbumUserStatus {
  return status ?? EMPTY_ALBUM_STATUS;
}
