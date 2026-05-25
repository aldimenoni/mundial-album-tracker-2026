import type { StickerDto, StickerMissingUsersDto } from "@mundial-album/shared";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { toStickerDto, toUserDto } from "../../utils/dto.js";
import { HttpError } from "../../utils/http-error.js";
import type { ListStickersQuery } from "./stickers.schemas.js";

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

export async function findUsersMissingSticker(code: string): Promise<StickerMissingUsersDto> {
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

  return {
    sticker: toStickerDto(sticker),
    users: users
      .filter((user) => !ownedUserIds.has(user.id))
      .map((user) => ({
        user: toUserDto(user),
        quantityOwned: 0
      }))
  };
}
