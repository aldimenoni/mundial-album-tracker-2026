import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPendingSettlementMessage,
  buildSettlementTransferPlan,
  computeSettlementCount,
  getPendingCountsForViewer,
  reducePendingCounts
} from "./pending-settlement.js";

describe("pending-settlement", () => {
  it("calcula deuda desde la perspectiva del otro usuario", () => {
    const proposal = {
      fromUserId: "user-a",
      pendingCountForMe: 2,
      pendingCountForOther: 0
    };

    assert.deepEqual(getPendingCountsForViewer(proposal, "user-b"), {
      owedToMe: 0,
      owedByMe: 2
    });
  });

  it("reduce primero lo que el otro debe al iniciador", () => {
    assert.deepEqual(reducePendingCounts(2, 1, 2), {
      pendingCountForMe: 0,
      pendingCountForOther: 1
    });
  });

  it("limita la cantidad de pares a saldar", () => {
    assert.equal(computeSettlementCount(3, 2, 2, 0), 2);
    assert.equal(computeSettlementCount(1, 0, 0, 0), 0);
  });

  it("permite saldar solo con repetidas del otro", () => {
    assert.equal(computeSettlementCount(0, 2, 2, 0), 2);
    assert.deepEqual(
      buildSettlementTransferPlan([], ["COL1", "COL2"], 2, 0),
      {
        stickersGivenByMe: [],
        stickersGivenByOther: ["COL1", "COL2"],
        settledCount: 2
      }
    );
  });

  it("arma mensaje de deuda para el usuario", () => {
    assert.match(buildPendingSettlementMessage("pepe", 0, 2), /Debés 2 figuritas a @pepe/);
  });
});
