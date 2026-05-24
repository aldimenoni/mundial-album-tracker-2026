import type { CompareAlbumUserStatus, ExchangeAnalysisDto } from "@mundial-album/shared";
import { buildExchangeBalancePreview } from "@mundial-album/shared";
import { buildSettlementSteps } from "./pending-settlement.js";

export type ExchangePairSuggestion = {
  give: string | null;
  receive: string | null;
};

export type ExchangeStickerState = {
  stickerId: string;
  code: string;
  quantityOwned: number;
  quantityRepeated: number;
  tracked: boolean;
};

export type ExchangeAlbumInput = {
  userId: string;
  userName: string;
  stickers: ExchangeStickerState[];
};

export type ExchangeAnalysisInput = {
  me: ExchangeAlbumInput;
  other: ExchangeAlbumInput;
};

export type ExchangeAnalysisResult = ExchangeAnalysisDto & {
  myStatus: CompareAlbumUserStatus;
  otherStatus: CompareAlbumUserStatus;
  suggestions: ExchangePairSuggestion[];
};

function stickerMap(stickers: ExchangeStickerState[]): Map<string, ExchangeStickerState> {
  return new Map(stickers.map((sticker) => [sticker.stickerId, sticker]));
}

function isKnownMissing(sticker: ExchangeStickerState | undefined): boolean {
  return Boolean(sticker?.tracked && sticker.quantityOwned === 0);
}

function isOfferableRepeated(sticker: ExchangeStickerState | undefined): boolean {
  return (sticker?.quantityRepeated ?? 0) > 0;
}

export function computeCanGive(
  myStickers: ExchangeStickerState[],
  otherStickers: ExchangeStickerState[]
): string[] {
  const otherById = stickerMap(otherStickers);

  return myStickers
    .filter((sticker) => isOfferableRepeated(sticker))
    .filter((sticker) => (otherById.get(sticker.stickerId)?.quantityOwned ?? 0) === 0)
    .map((sticker) => sticker.code);
}

export function computeCanReceive(
  myStickers: ExchangeStickerState[],
  otherStickers: ExchangeStickerState[]
): string[] {
  const myById = stickerMap(myStickers);

  return otherStickers
    .filter((sticker) => isOfferableRepeated(sticker))
    .filter((sticker) => (myById.get(sticker.stickerId)?.quantityOwned ?? 0) === 0)
    .map((sticker) => sticker.code);
}

function buildSuggestions(
  canGive: string[],
  canReceive: string[],
  pendingCountForMe: number,
  pendingCountForOther: number
): ExchangePairSuggestion[] {
  return buildSettlementSteps(
    canGive,
    canReceive,
    pendingCountForMe,
    pendingCountForOther
  ).map((step) => ({
    give: step.stickersGivenByMe[0] ?? null,
    receive: step.stickersGivenByOther[0] ?? null
  }));
}

function buildPartialMessage(
  otherName: string,
  canGiveCount: number,
  canReceiveCount: number,
  pendingCountForMe: number,
  pendingCountForOther: number
): string {
  return buildExchangeBalancePreview({
    otherUserName: otherName,
    giveCount: canGiveCount,
    receiveCount: canReceiveCount,
    pendingCountForMe,
    pendingCountForOther
  });
}

function buildPendingMessage(otherName: string, canGiveCount: number): string {
  return `Podés darle ${canGiveCount} repetida${canGiveCount === 1 ? "" : "s"} porque no ${canGiveCount === 1 ? "la tiene" : "las tiene"}. Das ${canGiveCount} y no recibís ahora; quedarían ${canGiveCount} ${canGiveCount === 1 ? "figurita" : "figuritas"} a tu favor con @${otherName}.`;
}

function buildExchangeAlbumStatus(stickers: ExchangeStickerState[]): CompareAlbumUserStatus {
  return {
    albumLoaded: stickers.some((sticker) => sticker.tracked),
    hasMissingTracked: stickers.some(
      (sticker) => sticker.tracked && sticker.quantityOwned === 0
    ),
    hasRepeatedStickers: stickers.some((sticker) => sticker.quantityRepeated > 0)
  };
}

export function determineExchangeType(
  canGive: string[],
  canReceive: string[],
  myStatus: CompareAlbumUserStatus,
  otherStatus: CompareAlbumUserStatus,
  otherName: string
): Pick<ExchangeAnalysisDto, "type" | "pendingCountForMe" | "pendingCountForOther" | "message"> {
  if (canGive.length === 0 && canReceive.length === 0) {
    return {
      type: "NOT_AVAILABLE",
      pendingCountForMe: 0,
      pendingCountForOther: 0,
      message: "No encontramos coincidencias para intercambio por ahora."
    };
  }

  if (canGive.length > 0 && !otherStatus.hasRepeatedStickers) {
    return {
      type: "PENDING",
      pendingCountForMe: canGive.length,
      pendingCountForOther: 0,
      message: buildPendingMessage(otherName, canGive.length)
    };
  }

  const pendingCountForMe = Math.max(0, canGive.length - canReceive.length);
  const pendingCountForOther = Math.max(0, canReceive.length - canGive.length);

  if (pendingCountForMe > 0 || pendingCountForOther > 0) {
    return {
      type: "PARTIAL",
      pendingCountForMe,
      pendingCountForOther,
      message: buildPartialMessage(
        otherName,
        canGive.length,
        canReceive.length,
        pendingCountForMe,
        pendingCountForOther
      )
    };
  }

  if (canGive.length === 1 && canReceive.length === 1) {
    return {
      type: "DIRECT",
      pendingCountForMe: 0,
      pendingCountForOther: 0,
      message: "Intercambio directo uno a uno sugerido."
    };
  }

  return {
    type: "MULTIPLE",
    pendingCountForMe: 0,
    pendingCountForOther: 0,
    message: "Intercambio múltiple equivalente sugerido."
  };
}

export function analyzeExchange(input: ExchangeAnalysisInput): ExchangeAnalysisResult {
  const myStatus = buildExchangeAlbumStatus(input.me.stickers);
  const otherStatus = buildExchangeAlbumStatus(input.other.stickers);
  const canGive = computeCanGive(input.me.stickers, input.other.stickers);
  const canReceive = computeCanReceive(input.me.stickers, input.other.stickers);
  const classification = determineExchangeType(
    canGive,
    canReceive,
    myStatus,
    otherStatus,
    input.other.userName
  );

  return {
    type: classification.type,
    canGive,
    canReceive,
    pendingCountForMe: classification.pendingCountForMe,
    pendingCountForOther: classification.pendingCountForOther,
    message: classification.message,
    myStatus,
    otherStatus,
    suggestions: buildSuggestions(
      canGive,
      canReceive,
      classification.pendingCountForMe,
      classification.pendingCountForOther
    )
  };
}

export function toExchangeStickerState(
  stickerId: string,
  code: string,
  quantityOwned: number,
  quantityRepeated: number,
  tracked: boolean
): ExchangeStickerState {
  return {
    stickerId,
    code,
    quantityOwned,
    quantityRepeated,
    tracked
  };
}
