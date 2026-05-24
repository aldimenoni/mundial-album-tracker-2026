export type StickerCounts = {
  quantityOwned: number;
  quantityRepeated: number;
};

export function computeGiveTransfer(counts: StickerCounts): StickerCounts {
  if (counts.quantityRepeated < 1) {
    throw new Error("No hay repetida disponible para intercambiar.");
  }

  return {
    quantityOwned: Math.max(counts.quantityOwned, 1),
    quantityRepeated: counts.quantityRepeated - 1
  };
}

export function computeReceiveTransfer(counts: StickerCounts): StickerCounts {
  if (counts.quantityOwned > 0) {
    throw new Error("La figurita ya está marcada como pegada.");
  }

  return {
    quantityOwned: 1,
    quantityRepeated: counts.quantityRepeated
  };
}
