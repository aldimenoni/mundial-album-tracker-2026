import type { AlbumDto, CompareAlbumDto } from "@mundial-album/shared";
import type { Sticker, User, UserSticker } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { toUserDto, toUserStickerDto } from "../../utils/dto.js";
import { HttpError } from "../../utils/http-error.js";
import { getAlbum } from "./albums.service.js";
import { buildCompareAlbumDto } from "../exchanges/exchange.mapper.js";

function buildAlbumDto(user: User, stickers: Sticker[], userStickers: UserSticker[]): AlbumDto {
  const userStickerByStickerId = new Map(
    userStickers.map((userSticker) => [userSticker.stickerId, userSticker])
  );

  return {
    user: toUserDto(user),
    stickers: stickers.map((sticker) =>
      toUserStickerDto(sticker, userStickerByStickerId.get(sticker.id))
    )
  };
}

function groupUserStickersByUserId(userStickers: UserSticker[]): Map<string, UserSticker[]> {
  const grouped = new Map<string, UserSticker[]>();

  for (const userSticker of userStickers) {
    const current = grouped.get(userSticker.userId) ?? [];
    current.push(userSticker);
    grouped.set(userSticker.userId, current);
  }

  return grouped;
}

export async function listAlbumComparisons(myUserId: string): Promise<CompareAlbumDto[]> {
  const [myUser, otherUsers, stickers] = await prisma.$transaction([
    prisma.user.findUnique({ where: { id: myUserId } }),
    prisma.user.findMany({
      where: { id: { not: myUserId } },
      orderBy: { name: "asc" }
    }),
    prisma.sticker.findMany({ orderBy: { orderIndex: "asc" } })
  ]);

  if (!myUser) {
    throw new HttpError(404, "User not found");
  }

  if (otherUsers.length === 0) {
    return [];
  }

  const userIds = [myUserId, ...otherUsers.map((user) => user.id)];
  const allUserStickers = await prisma.userSticker.findMany({
    where: { userId: { in: userIds } }
  });
  const userStickersByUserId = groupUserStickersByUserId(allUserStickers);
  const myAlbum = buildAlbumDto(myUser, stickers, userStickersByUserId.get(myUserId) ?? []);

  return otherUsers.map((otherUser) =>
    buildCompareAlbumDto(
      myAlbum,
      buildAlbumDto(otherUser, stickers, userStickersByUserId.get(otherUser.id) ?? [])
    )
  );
}

export async function compareAlbums(
  myUserId: string,
  otherUserId: string
): Promise<CompareAlbumDto> {
  if (myUserId === otherUserId) {
    throw new HttpError(400, "No podés comparar el álbum con el mismo usuario.");
  }

  const [myUser, otherUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: myUserId } }),
    prisma.user.findUnique({ where: { id: otherUserId } })
  ]);

  if (!myUser) {
    throw new HttpError(404, "User not found");
  }

  if (!otherUser) {
    throw new HttpError(404, "User not found");
  }

  const [myAlbum, otherAlbum] = await Promise.all([getAlbum(myUserId), getAlbum(otherUserId)]);

  return buildCompareAlbumDto(myAlbum, otherAlbum);
}
