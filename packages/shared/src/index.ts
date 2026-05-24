export const STICKER_TYPES = ["STANDARD", "COCA_COLA", "SPECIAL"] as const;
export type StickerType = (typeof STICKER_TYPES)[number];

import type { CompareAlbumUserStatus } from "./compare.js";
import type { ExchangeStatus, ExchangeType } from "./exchange.js";

export const ALBUM_STATUSES = ["missing", "owned", "repeated"] as const;
export type AlbumStickerStatus = (typeof ALBUM_STATUSES)[number];

export interface UserDto {
  id: string;
  name: string;
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

export interface ExecuteExchangeResultDto {
  proposal: import("./exchange.js").ExchangeProposalDto;
  fromUserSummary: AlbumSummaryDto;
  toUserSummary: AlbumSummaryDto;
  message: string;
}

export interface CreateUserPayload {
  name: string;
}

export interface UpdateUserStickerPayload {
  status?: AlbumStickerStatus;
  quantityOwned?: number;
  quantityRepeated?: number;
}

export interface TradeSuggestionDto {
  receive: StickerDto | null;
  give: StickerDto | null;
}

export interface CompareAlbumDto {
  myUser: UserDto;
  otherUser: UserDto;
  type: ExchangeType;
  canGive: StickerDto[];
  canReceive: StickerDto[];
  myRepeatedStickers: StickerDto[];
  otherRepeatedStickers: StickerDto[];
  pendingCountForMe: number;
  pendingCountForOther: number;
  message: string;
  suggestions: TradeSuggestionDto[];
  myStatus: CompareAlbumUserStatus;
  otherStatus: CompareAlbumUserStatus;
}

export interface ApiErrorResponse {
  message: string;
  issues?: unknown;
}

export {
  albumHasMissingTrackedData,
  albumHasRepeatedStickers,
  albumHasTrackedData,
  buildAlbumUserStatus,
  resolveAlbumStatus,
  type CompareAlbumUserStatus
} from "./compare.js";
export {
  EXCHANGE_STATUSES,
  EXCHANGE_STATUS_LABELS,
  EXCHANGE_TYPES,
  EXCHANGE_TYPE_LABELS,
  type CreateExchangePayload,
  type ExchangeAnalysisDto,
  type ExchangeProposalDto,
  type ExchangeStatus,
  type ExchangeType,
  type FinalizeExchangePayload,
  type PendingSettlementDto,
  type SettlementOptionDto
} from "./exchange.js";
export {
  ALBUM_SPREADS,
  getAlbumSpreadFilterGroups,
  getAlbumSpreadFilterOptions,
  getAlbumTeamNames,
  getSpreadFilterValue,
  getSpreadStickers,
  getSpreadSummary,
  HISTORY_1_FILTER_LABEL,
  HISTORY_2_FILTER_LABEL,
  INTRO_SPREAD_FILTER_LABEL,
  type AlbumSpreadDefinition,
  type AlbumSpreadFilterGroups
} from "./album-pages.js";
export {
  getFlagSrc,
  getSpreadVisualTheme,
  getTeamTheme,
  type SpreadVisualTheme,
  type TeamTheme
} from "./team-themes.js";
