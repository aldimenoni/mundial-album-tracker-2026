export const STICKER_TYPES = ["STANDARD", "COCA_COLA", "SPECIAL"] as const;
export type StickerType = (typeof STICKER_TYPES)[number];

export const ALBUM_STATUSES = ["missing", "owned", "repeated"] as const;
export type AlbumStickerStatus = (typeof ALBUM_STATUSES)[number];

export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface StickerDto {
  id: string;
  code: string;
  number: number | null;
  team: string | null;
  playerName: string | null;
  type: StickerType;
  section: string | null;
  orderIndex: number;
}

export interface UserStickerDto {
  id: string | null;
  stickerId: string;
  status: AlbumStickerStatus;
  quantityOwned: number;
  quantityRepeated: number;
  sticker: StickerDto;
}

export interface AlbumDto {
  user: UserDto;
  stickers: UserStickerDto[];
}

export interface AlbumSummaryDto {
  user: UserDto;
  totalStickers: number;
  totalOwned: number;
  totalMissing: number;
  totalRepeated: number;
  completionPercentage: number;
  totalCocaCola: number;
  missingCocaCola: number;
  repeatedCocaCola: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
}

export interface UpdateUserStickerPayload {
  status?: AlbumStickerStatus;
  quantityOwned?: number;
  quantityRepeated?: number;
}

export interface TradeSuggestionDto {
  receive: StickerDto;
  give: StickerDto;
}

export interface CompareAlbumDto {
  myUser: UserDto;
  otherUser: UserDto;
  theyCanGive: StickerDto[];
  iCanGive: StickerDto[];
  suggestions: TradeSuggestionDto[];
}

export interface ApiErrorResponse {
  message: string;
  issues?: unknown;
}
