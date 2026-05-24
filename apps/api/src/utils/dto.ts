import type { Sticker, User, UserSticker } from "@prisma/client";
import type {
  AlbumStickerStatus,
  StickerDto,
  StickerType,
  UserDto,
  UserStickerDto
} from "@mundial-album/shared";

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export function toStickerDto(sticker: Sticker): StickerDto {
  return {
    id: sticker.id,
    code: sticker.code,
    number: sticker.number,
    team: sticker.team,
    playerName: sticker.playerName,
    type: sticker.type as StickerType,
    section: sticker.section,
    orderIndex: sticker.orderIndex
  };
}

export function getAlbumStickerStatus(
  quantityOwned: number,
  quantityRepeated: number
): AlbumStickerStatus {
  if (quantityRepeated > 0) {
    return "repeated";
  }

  if (quantityOwned > 0) {
    return "owned";
  }

  return "missing";
}

export function toUserStickerDto(
  sticker: Sticker,
  userSticker?: UserSticker | null
): UserStickerDto {
  const quantityOwned = userSticker?.quantityOwned ?? 0;
  const quantityRepeated = userSticker?.quantityRepeated ?? 0;

  return {
    id: userSticker?.id ?? null,
    stickerId: sticker.id,
    status: getAlbumStickerStatus(quantityOwned, quantityRepeated),
    quantityOwned,
    quantityRepeated,
    sticker: toStickerDto(sticker)
  };
}
