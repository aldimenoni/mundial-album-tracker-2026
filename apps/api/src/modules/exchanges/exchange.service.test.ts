import {
  analyzeExchange,
  buildOneToOneSuggestions,
  computeCanGive,
  computeCanReceive,
  determineExchangeType,
  isValidAllOneToOneSelection,
  isValidOneToOneSelection,
  toExchangeStickerState
} from "./exchange.service.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

function sticker(
  id: string,
  code: string,
  owned: number,
  repeated: number,
  tracked: boolean
) {
  return toExchangeStickerState(id, code, owned, repeated, tracked);
}

describe("ExchangeService", () => {
  it("calculates canGive from my repeated stickers missing for the other user", () => {
    const myStickers = [sticker("1", "ARG10", 1, 1, true), sticker("2", "URU4", 1, 1, true)];
    const otherStickers = [
      sticker("1", "ARG10", 0, 0, true),
      sticker("2", "URU4", 1, 0, true)
    ];

    assert.deepEqual(computeCanGive(myStickers, otherStickers), ["ARG10"]);
  });

  it("ignores stickers with quantityRepeated = 0", () => {
    const myStickers = [sticker("1", "ARG10", 1, 0, true)];
    const otherStickers = [sticker("1", "ARG10", 0, 0, true)];

    assert.deepEqual(computeCanGive(myStickers, otherStickers), []);
  });

  it("offers canGive when other user has not loaded the sticker yet", () => {
    const myStickers = [sticker("1", "ARG10", 1, 1, true)];
    const otherStickers = [sticker("2", "BRA5", 1, 0, true)];

    assert.deepEqual(computeCanGive(myStickers, otherStickers), ["ARG10"]);
  });

  it("ignores owned stickers as missing", () => {
    const myStickers = [sticker("1", "ARG10", 1, 1, true)];
    const otherStickers = [sticker("1", "ARG10", 1, 0, true)];

    assert.deepEqual(computeCanGive(myStickers, otherStickers), []);
  });

  it("returns DIRECT for one-to-one exchange", () => {
    const result = determineExchangeType(["ARG10"], ["BRA5"], "sofi");

    assert.equal(result.type, "DIRECT");
    assert.equal(result.pendingCountForMe, 0);
    assert.equal(result.pendingCountForOther, 0);
  });

  it("returns MULTIPLE for several one-to-one exchanges", () => {
    const result = determineExchangeType(["ARG10", "URU4"], ["BRA5", "FRA8"], "sofi");

    assert.equal(result.type, "MULTIPLE");
    assert.equal(result.pendingCountForMe, 0);
  });

  it("returns NOT_AVAILABLE when only one side can trade", () => {
    assert.equal(
      determineExchangeType(["ARG10", "URU4"], [], "sofi").type,
      "NOT_AVAILABLE"
    );
    assert.equal(
      determineExchangeType(["ARG10", "URU4"], [], "sofi").message,
      "@sofi no tiene repetidas para un intercambio."
    );
    assert.equal(
      determineExchangeType([], ["BRA5"], "sofi").type,
      "NOT_AVAILABLE"
    );
    assert.equal(
      determineExchangeType([], ["BRA5"], "sofi").message,
      "No tenés repetidas que le falten a @sofi."
    );
  });

  it("calculates canReceive from repeated stickers even when mine is untracked", () => {
    const myStickers = [sticker("1", "ARG10", 0, 0, false)];
    const otherStickers = [sticker("1", "ARG10", 1, 1, true)];

    assert.deepEqual(computeCanReceive(myStickers, otherStickers), ["ARG10"]);
  });

  it("builds only balanced one-to-one suggestions", () => {
    assert.deepEqual(buildOneToOneSuggestions(["URU4"], ["BRA5", "ARG12"]), [
      { give: "URU4", receive: "BRA5" }
    ]);
  });

  it("validates all one-to-one selections when there are multiple pairs", () => {
    assert.equal(
      isValidAllOneToOneSelection(
        {
          stickersGivenByMe: ["ARG12", "ESP7"],
          stickersGivenByOther: ["BRA5", "FRA8"]
        },
        ["ARG12", "ESP7"],
        ["BRA5", "FRA8", "GER9"]
      ),
      true
    );
    assert.equal(
      isValidAllOneToOneSelection(
        { stickersGivenByMe: ["ARG12"], stickersGivenByOther: ["BRA5"] },
        ["ARG12", "ESP7"],
        ["BRA5", "FRA8"]
      ),
      false
    );
  });

  it("validates one-to-one selection against suggestions", () => {
    assert.equal(
      isValidOneToOneSelection(
        { stickersGivenByMe: ["URU4"], stickersGivenByOther: ["BRA5"] },
        ["URU4"],
        ["BRA5", "ARG12"]
      ),
      true
    );
    assert.equal(
      isValidOneToOneSelection(
        { stickersGivenByMe: ["URU4"], stickersGivenByOther: ["ARG12"] },
        ["URU4"],
        ["BRA5", "ARG12"]
      ),
      false
    );
  });

  it("returns NOT_AVAILABLE when there are no matches", () => {
    const result = determineExchangeType([], [], "sofi");

    assert.equal(result.type, "NOT_AVAILABLE");
    assert.equal(result.message, "No hay intercambios disponibles con @sofi.");
  });

  it("analyzes balanced exchange scenario", () => {
    const analysis = analyzeExchange({
      me: {
        userId: "me",
        userName: "aldiluqui",
        stickers: [
          sticker("1", "URU4", 1, 1, true),
          sticker("2", "BRA5", 0, 0, true),
          sticker("3", "ARG12", 0, 0, true)
        ]
      },
      other: {
        userId: "sofi",
        userName: "sofi",
        stickers: [
          sticker("1", "URU4", 0, 0, true),
          sticker("2", "BRA5", 1, 1, true),
          sticker("3", "ARG12", 1, 1, true)
        ]
      }
    });

    assert.deepEqual(analysis.canReceive, ["BRA5", "ARG12"]);
    assert.deepEqual(analysis.canGive, ["URU4"]);
    assert.equal(analysis.type, "DIRECT");
    assert.equal(analysis.suggestions.length, 1);
    assert.deepEqual(analysis.suggestions[0], { give: "URU4", receive: "BRA5" });
  });

  it("suggests one-to-one pairs when both sides can trade", () => {
    const analysis = analyzeExchange({
      me: {
        userId: "me",
        userName: "aldiluqui",
        stickers: [
          sticker("1", "ARG12", 1, 1, true),
          sticker("2", "ESP7", 1, 1, true)
        ]
      },
      other: {
        userId: "sofi",
        userName: "sofi",
        stickers: [
          sticker("3", "BRA5", 1, 1, true),
          sticker("4", "FRA8", 1, 1, true),
          sticker("5", "ARG12", 0, 0, true),
          sticker("6", "ESP7", 0, 0, true)
        ]
      }
    });

    assert.equal(analysis.type, "MULTIPLE");
    assert.equal(analysis.suggestions.length, 2);
    assert.deepEqual(analysis.suggestions[0], { give: "ARG12", receive: "BRA5" });
  });
});

describe("Album status helpers", () => {
  it("detects missing tracked data only when sticker is explicitly tracked as missing", () => {
    const stickers = [
      toExchangeStickerState("1", "ARG10", 0, 0, true),
      toExchangeStickerState("2", "BRA5", 0, 0, false)
    ];

    assert.equal(stickers.some((sticker) => sticker.tracked && sticker.quantityOwned === 0), true);
    assert.equal(stickers.some((sticker) => sticker.quantityRepeated > 0), false);
  });
});
