import type { CompareAlbumDto } from "@mundial-album/shared";
import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../utils/http-error.js";
import { getAlbum } from "./albums.service.js";
import { buildCompareAlbumDto } from "../exchanges/exchange.mapper.js";

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
