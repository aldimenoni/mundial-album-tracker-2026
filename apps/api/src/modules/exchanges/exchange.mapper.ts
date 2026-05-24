import type { ExchangeAlbumInput, ExchangeStickerState } from "./exchange.service.js";
import type { AlbumDto, CompareAlbumDto, StickerDto, TradeSuggestionDto } from "@mundial-album/shared";
import { mapRepeatedStickers } from "./custom-exchange.js";
import { analyzeExchange, toExchangeStickerState } from "./exchange.service.js";

function mapAlbumToExchangeInput(album: AlbumDto): ExchangeAlbumInput {
  return {
    userId: album.user.id,
    userName: album.user.name,
    stickers: album.stickers.map((item) =>
      toExchangeStickerState(
        item.stickerId,
        item.sticker.code,
        item.quantityOwned,
        item.quantityRepeated,
        item.id !== null
      )
    )
  };
}

function stickerByCode(stickers: StickerDto[]): Map<string, StickerDto> {
  return new Map(stickers.map((sticker) => [sticker.code, sticker]));
}

function mapCodesToStickers(codes: string[], catalog: StickerDto[]): StickerDto[] {
  const byCode = stickerByCode(catalog);

  return codes
    .map((code) => byCode.get(code))
    .filter((sticker): sticker is StickerDto => Boolean(sticker));
}

function mapSuggestions(
  suggestions: Array<{ give: string | null; receive: string | null }>,
  catalog: StickerDto[]
): TradeSuggestionDto[] {
  const byCode = stickerByCode(catalog);

  return suggestions.flatMap((suggestion) => {
    const give = suggestion.give ? byCode.get(suggestion.give) ?? null : null;
    const receive = suggestion.receive ? byCode.get(suggestion.receive) ?? null : null;

    if (!give && !receive) {
      return [];
    }

    return [{ give, receive }];
  });
}

export function buildCompareAlbumDto(myAlbum: AlbumDto, otherAlbum: AlbumDto): CompareAlbumDto {
  const catalog = [
    ...myAlbum.stickers.map((item) => item.sticker),
    ...otherAlbum.stickers.map((item) => item.sticker)
  ];
  const analysis = analyzeExchange({
    me: mapAlbumToExchangeInput(myAlbum),
    other: mapAlbumToExchangeInput(otherAlbum)
  });

  return {
    myUser: myAlbum.user,
    otherUser: otherAlbum.user,
    type: analysis.type,
    canGive: mapCodesToStickers(analysis.canGive, catalog),
    canReceive: mapCodesToStickers(analysis.canReceive, catalog),
    myRepeatedStickers: mapRepeatedStickers(myAlbum),
    otherRepeatedStickers: mapRepeatedStickers(otherAlbum),
    pendingCountForMe: analysis.pendingCountForMe,
    pendingCountForOther: analysis.pendingCountForOther,
    message: analysis.message,
    suggestions: mapSuggestions(analysis.suggestions, catalog),
    myStatus: analysis.myStatus,
    otherStatus: analysis.otherStatus
  };
}

export function mapUserStickersToExchangeStates(
  stickers: AlbumDto["stickers"]
): ExchangeStickerState[] {
  return stickers.map((item) =>
    toExchangeStickerState(
      item.stickerId,
      item.sticker.code,
      item.quantityOwned,
      item.quantityRepeated,
      item.id !== null
    )
  );
}
