import type { StickerDto, StickerMissingExchangeHint, StickerMissingUsersDto } from "@mundial-album/shared";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { toStickerDto, toUserDto } from "../../utils/dto.js";
import { HttpError } from "../../utils/http-error.js";
import { getAlbum } from "../albums/albums.service.js";
import { analyzeExchange, toExchangeStickerState } from "../exchanges/exchange.service.js";
import type { ListStickersQuery } from "./stickers.schemas.js";

function mapAlbumToExchangeInput(album: Awaited<ReturnType<typeof getAlbum>>) {
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

function resolveExchangeHint(
  stickerCode: string,
  canGive: string[],
  canReceive: string[]
): StickerMissingExchangeHint | null {
  if (canGive.includes(stickerCode)) {
    return "give-this";
  }

  if (canGive.length > 0 && canReceive.length > 0) {
    return "exchange-available";
  }

  return null;
}

export async function listStickers(query: ListStickersQuery): Promise<StickerDto[]> {
  const args: Prisma.StickerFindManyArgs = {
    orderBy: { orderIndex: "asc" }
  };

  if (query.team) {
    args.where = { team: query.team };
  }

  const stickers = await prisma.sticker.findMany(args);

  return stickers.map(toStickerDto);
}

export async function findUsersMissingSticker(
  code: string,
  viewerUserId?: string
): Promise<StickerMissingUsersDto> {
  const sticker = await prisma.sticker.findUnique({ where: { code } });

  if (!sticker) {
    throw new HttpError(404, `Figurita ${code} no encontrada.`);
  }

  const [users, ownedEntries] = await prisma.$transaction([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.userSticker.findMany({
      where: {
        stickerId: sticker.id,
        quantityOwned: { gt: 0 }
      },
      select: { userId: true }
    })
  ]);

  const ownedUserIds = new Set(ownedEntries.map((entry) => entry.userId));
  const missingUsers = users.filter(
    (user) => !ownedUserIds.has(user.id) && user.id !== viewerUserId
  );

  if (!viewerUserId) {
    return {
      sticker: toStickerDto(sticker),
      users: missingUsers.map((user) => ({
        user: toUserDto(user),
        quantityOwned: 0
      }))
    };
  }

  const viewer = await prisma.user.findUnique({ where: { id: viewerUserId } });

  if (!viewer) {
    throw new HttpError(404, "User not found");
  }

  const viewerAlbum = await getAlbum(viewerUserId);
  const viewerExchangeInput = mapAlbumToExchangeInput(viewerAlbum);

  const usersWithHints = await Promise.all(
    missingUsers.map(async (user) => {
      const otherAlbum = await getAlbum(user.id);
      const analysis = analyzeExchange({
        me: viewerExchangeInput,
        other: mapAlbumToExchangeInput(otherAlbum)
      });

      return {
        user: toUserDto(user),
        quantityOwned: 0,
        exchangeHint: resolveExchangeHint(code, analysis.canGive, analysis.canReceive)
      };
    })
  );

  return {
    sticker: toStickerDto(sticker),
    users: usersWithHints
  };
}
