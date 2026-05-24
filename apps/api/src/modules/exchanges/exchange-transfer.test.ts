import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeGiveTransfer, computeReceiveTransfer } from "./exchange-transfer.js";

describe("exchange-transfer", () => {
  it("resta una repetida al dar una figurita", () => {
    assert.deepEqual(computeGiveTransfer({ quantityOwned: 1, quantityRepeated: 2 }), {
      quantityOwned: 1,
      quantityRepeated: 1
    });
  });

  it("rechaza dar sin repetidas", () => {
    assert.throws(() => computeGiveTransfer({ quantityOwned: 1, quantityRepeated: 0 }));
  });

  it("marca como pegada al recibir una figurita faltante", () => {
    assert.deepEqual(computeReceiveTransfer({ quantityOwned: 0, quantityRepeated: 0 }), {
      quantityOwned: 1,
      quantityRepeated: 0
    });
  });

  it("rechaza recibir una figurita ya pegada", () => {
    assert.throws(() => computeReceiveTransfer({ quantityOwned: 1, quantityRepeated: 0 }));
  });
});
