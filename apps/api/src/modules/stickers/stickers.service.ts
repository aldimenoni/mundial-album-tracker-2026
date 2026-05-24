import type { StickerDto } from "@mundial-album/shared";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { toStickerDto } from "../../utils/dto.js";
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
