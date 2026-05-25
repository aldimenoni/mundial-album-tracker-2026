import type { AlbumDto, AlbumSummaryDto } from "@mundial-album/shared";
import { buildAlbumSpreadProgress, buildLegendaryMedals } from "@mundial-album/shared";
import type { Prisma, UserSticker } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { toUserDto, toUserStickerDto } from "../../utils/dto.js";
import { HttpError } from "../../utils/http-error.js";
import type { UpdateUserStickerInput } from "./albums.schemas.js";

type StickerCounts = Pick<UserSticker, "quantityOwned" | "quantityRepeated"> | null;

type NormalizedStickerUpdate = {
  quantityOwned: number;
  quantityRepeated: number;
};

function normalizeStickerUpdate(
  input: UpdateUserStickerInput,
  existing: StickerCounts
): NormalizedStickerUpdate {
  if (input.status === "missing") {
    return { quantityOwned: 0, quantityRepeated: 0 };
  }

  if (input.status === "owned") {
    return {
      quantityOwned: Math.max(input.quantityOwned ?? existing?.quantityOwned ?? 1, 1),
      quantityRepeated: 0
    };
  }

  if (input.status === "repeated") {
    return {
      quantityOwned: Math.max(input.quantityOwned ?? existing?.quantityOwned ?? 1, 1),
      quantityRepeated: Math.max(input.quantityRepeated ?? existing?.quantityRepeated ?? 1, 1)
    };
  }

  const quantityOwned = input.quantityOwned ?? existing?.quantityOwned ?? 0;
  const quantityRepeated = input.quantityRepeated ?? existing?.quantityRepeated ?? 0;
  const normalizedOwned = quantityRepeated > 0 ? Math.max(quantityOwned, 1) : quantityOwned;

  return {
    quantityOwned: normalizedOwned,
    quantityRepeated: normalizedOwned === 0 ? 0 : quantityRepeated
  };
}

function isAlbumPasteActivity(
  normalized: NormalizedStickerUpdate,
  existing: StickerCounts
): boolean {
  const previousOwned = existing?.quantityOwned ?? 0;
  const previousRepeated = existing?.quantityRepeated ?? 0;

  return (
    normalized.quantityOwned > previousOwned || normalized.quantityRepeated > previousRepeated
  );
}

export async function touchLastAlbumActivity(
  userId: string,
  at: Date = new Date(),
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma;

  await client.user.update({
    where: { id: userId },
    data: { lastAlbumActivityAt: at }
  });
}


export async function getAlbum(userId: string): Promise<AlbumDto> {
  const [user, stickers, userStickers] = await prisma.$transaction([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.sticker.findMany({ orderBy: { orderIndex: "asc" } }),
    prisma.userSticker.findMany({ where: { userId } })
  ]);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

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

export async function updateAlbumSticker(
  userId: string,
  stickerId: string,
  input: UpdateUserStickerInput
) {
  const [user, sticker, existing] = await prisma.$transaction([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.sticker.findUnique({ where: { id: stickerId } }),
    prisma.userSticker.findUnique({
      where: {
        userId_stickerId: {
          userId,
          stickerId
        }
      }
    })
  ]);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  if (!sticker) {
    throw new HttpError(404, "Sticker not found");
  }

  const normalized = normalizeStickerUpdate(input, existing);
  const shouldTrackActivity = isAlbumPasteActivity(normalized, existing);

  const userSticker = await prisma.$transaction(async (tx) => {
    const record = await tx.userSticker.upsert({
      where: {
        userId_stickerId: {
          userId,
          stickerId
        }
      },
      update: normalized,
      create: {
        userId,
        stickerId,
        ...normalized
      }
    });

    if (shouldTrackActivity) {
      await touchLastAlbumActivity(userId, new Date(), tx);
    }

    return record;
  });

  return toUserStickerDto(sticker, userSticker);
}

export async function getAlbumSummary(userId: string): Promise<AlbumSummaryDto> {
  const [album, userActivity] = await Promise.all([
    getAlbum(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { lastAlbumActivityAt: true }
    })
  ]);
  const totalStickers = album.stickers.length;
  const totalOwned = album.stickers.filter((item) => item.quantityOwned > 0).length;
  const totalRepeated = album.stickers.reduce(
    (total, item) => total + item.quantityRepeated,
    0
  );
  const cocaColaStickers = album.stickers.filter(
    (item) => item.sticker.type === "COCA_COLA"
  );
  const totalCocaCola = cocaColaStickers.length;
  const missingCocaCola = cocaColaStickers.filter(
    (item) => item.quantityOwned === 0
  ).length;
  const repeatedCocaCola = cocaColaStickers.reduce(
    (total, item) => total + item.quantityRepeated,
    0
  );

  return {
    user: album.user,
    totalStickers,
    totalOwned,
    totalMissing: totalStickers - totalOwned,
    totalRepeated,
    completionPercentage:
      totalStickers === 0 ? 0 : Number(((totalOwned / totalStickers) * 100).toFixed(2)),
    totalCocaCola,
    missingCocaCola,
    repeatedCocaCola,
    spreadProgress: buildAlbumSpreadProgress(album.stickers),
    legendaryMedals: buildLegendaryMedals(album.stickers),
    lastUpdatedAt: userActivity?.lastAlbumActivityAt?.toISOString() ?? null
  };
}
