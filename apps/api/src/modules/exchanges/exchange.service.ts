import type { CompareAlbumUserStatus, ExchangeAnalysisDto } from "@mundial-album/shared";

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

export function buildOneToOneSuggestions(
  canGive: string[],
  canReceive: string[]
): ExchangePairSuggestion[] {
  const pairCount = Math.min(canGive.length, canReceive.length);

  return Array.from({ length: pairCount }, (_, index) => ({
    give: canGive[index] ?? null,
    receive: canReceive[index] ?? null
  }));
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
  otherName: string
): Pick<ExchangeAnalysisDto, "type" | "pendingCountForMe" | "pendingCountForOther" | "message"> {
  if (canGive.length === 0 || canReceive.length === 0) {
    return {
      type: "NOT_AVAILABLE",
      pendingCountForMe: 0,
      pendingCountForOther: 0,
      message:
        canGive.length > 0
          ? `@${otherName} no tiene repetidas para un intercambio uno a uno. Probá el intercambio personalizado.`
          : canReceive.length > 0
            ? `No tenés repetidas que le falten a @${otherName}.`
            : "No hay intercambios uno a uno disponibles por ahora."
    };
  }

  const pairCount = Math.min(canGive.length, canReceive.length);

  return {
    type: pairCount === 1 ? "DIRECT" : "MULTIPLE",
    pendingCountForMe: 0,
    pendingCountForOther: 0,
    message:
      pairCount === 1
        ? "Intercambio uno a uno sugerido."
        : `${pairCount} intercambios uno a uno sugeridos.`
  };
}

export function analyzeExchange(input: ExchangeAnalysisInput): ExchangeAnalysisResult {
  const myStatus = buildExchangeAlbumStatus(input.me.stickers);
  const otherStatus = buildExchangeAlbumStatus(input.other.stickers);
  const canGive = computeCanGive(input.me.stickers, input.other.stickers);
  const canReceive = computeCanReceive(input.me.stickers, input.other.stickers);
  const classification = determineExchangeType(canGive, canReceive, input.other.userName);
  const suggestions = buildOneToOneSuggestions(canGive, canReceive);

  return {
    type: classification.type,
    canGive,
    canReceive,
    pendingCountForMe: 0,
    pendingCountForOther: 0,
    message: classification.message,
    myStatus,
    otherStatus,
    suggestions
  };
}

export function buildAllOneToOneSelection(
  canGive: string[],
  canReceive: string[]
): { stickersGivenByMe: string[]; stickersGivenByOther: string[] } {
  const suggestions = buildOneToOneSuggestions(canGive, canReceive);

  return {
    stickersGivenByMe: suggestions.flatMap((pair) => (pair.give ? [pair.give] : [])),
    stickersGivenByOther: suggestions.flatMap((pair) => (pair.receive ? [pair.receive] : []))
  };
}

function selectionsMatch(
  left: { stickersGivenByMe: string[]; stickersGivenByOther: string[] },
  right: { stickersGivenByMe: string[]; stickersGivenByOther: string[] }
): boolean {
  return (
    left.stickersGivenByMe.length === right.stickersGivenByMe.length &&
    left.stickersGivenByOther.length === right.stickersGivenByOther.length &&
    left.stickersGivenByMe.every((code, index) => code === right.stickersGivenByMe[index]) &&
    left.stickersGivenByOther.every((code, index) => code === right.stickersGivenByOther[index])
  );
}

export function isValidOneToOneSelection(
  selection: { stickersGivenByMe: string[]; stickersGivenByOther: string[] },
  canGive: string[],
  canReceive: string[]
): boolean {
  if (selection.stickersGivenByMe.length !== 1 || selection.stickersGivenByOther.length !== 1) {
    return false;
  }

  const give = selection.stickersGivenByMe[0];
  const receive = selection.stickersGivenByOther[0];

  if (!give || !receive) {
    return false;
  }

  return buildOneToOneSuggestions(canGive, canReceive).some(
    (pair) => pair.give === give && pair.receive === receive
  );
}

export function isValidAllOneToOneSelection(
  selection: { stickersGivenByMe: string[]; stickersGivenByOther: string[] },
  canGive: string[],
  canReceive: string[]
): boolean {
  const expected = buildAllOneToOneSelection(canGive, canReceive);

  if (expected.stickersGivenByMe.length < 2) {
    return false;
  }

  return selectionsMatch(selection, expected);
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
