import type { AlbumDto, ExchangeType } from "@mundial-album/shared";
import { HttpError } from "../../utils/http-error.js";
import type { SettlementStep } from "./pending-settlement.js";

function albumStickerByCode(album: AlbumDto): Map<string, AlbumDto["stickers"][number]> {
  return new Map(album.stickers.map((item) => [item.sticker.code, item]));
}

function assertDistinctCodes(codes: string[]): void {
  if (new Set(codes).size !== codes.length) {
    throw new HttpError(409, "No podés repetir la misma figurita en la selección.");
  }
}

export function classifyCustomExchangeType(giveCount: number, receiveCount: number): ExchangeType {
  if (giveCount > 0 && receiveCount === 0) {
    return "PENDING";
  }

  if (giveCount === receiveCount) {
    return giveCount === 1 ? "DIRECT" : "MULTIPLE";
  }

  return "PARTIAL";
}

export function computeCustomPendingCounts(
  giveCount: number,
  receiveCount: number
): { pendingCountForMe: number; pendingCountForOther: number } {
  return {
    pendingCountForMe: Math.max(0, giveCount - receiveCount),
    pendingCountForOther: Math.max(0, receiveCount - giveCount)
  };
}

export function validateCustomSelection(
  myAlbum: AlbumDto,
  otherAlbum: AlbumDto,
  selection: SettlementStep
): void {
  const { stickersGivenByMe, stickersGivenByOther } = selection;

  if (stickersGivenByMe.length === 0 && stickersGivenByOther.length === 0) {
    throw new HttpError(400, "Elegí al menos una figurita para el intercambio personalizado.");
  }

  assertDistinctCodes(stickersGivenByMe);
  assertDistinctCodes(stickersGivenByOther);

  const myByCode = albumStickerByCode(myAlbum);
  const otherByCode = albumStickerByCode(otherAlbum);

  for (const code of stickersGivenByMe) {
    const item = myByCode.get(code);

    if (!item || item.quantityRepeated < 1) {
      throw new HttpError(409, `No tenés repetida disponible de ${code}.`);
    }
  }

  for (const code of stickersGivenByOther) {
    const item = otherByCode.get(code);

    if (!item || item.quantityRepeated < 1) {
      throw new HttpError(
        409,
        `@${otherAlbum.user.name} no tiene repetida disponible de ${code}.`
      );
    }

    const mine = myByCode.get(code);

    if (mine && mine.quantityOwned > 0) {
      throw new HttpError(409, `Ya tenés pegada ${code}.`);
    }
  }
}

export function mapRepeatedStickers(album: AlbumDto): AlbumDto["stickers"][number]["sticker"][] {
  return album.stickers
    .filter((item) => item.quantityRepeated > 0)
    .map((item) => item.sticker)
    .sort((left, right) => left.code.localeCompare(right.code, "es"));
}
