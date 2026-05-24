import {
  analyzeExchange,
  computeCanGive,
  computeCanReceive,
  determineExchangeType,
  toExchangeStickerState
} from "./exchange.service.js";
import type { CompareAlbumUserStatus } from "@mundial-album/shared";
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

function status(overrides: Partial<CompareAlbumUserStatus> = {}): CompareAlbumUserStatus {
  return {
    albumLoaded: true,
    hasMissingTracked: true,
    hasRepeatedStickers: true,
    ...overrides
  };
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
    const result = determineExchangeType(
      ["ARG10"],
      ["BRA5"],
      status(),
      status(),
      "sofi"
    );

    assert.equal(result.type, "DIRECT");
    assert.equal(result.pendingCountForMe, 0);
    assert.equal(result.pendingCountForOther, 0);
  });

  it("returns MULTIPLE for balanced multi exchange", () => {
    const result = determineExchangeType(
      ["ARG10", "URU4"],
      ["BRA5", "FRA8"],
      status(),
      status(),
      "sofi"
    );

    assert.equal(result.type, "MULTIPLE");
  });

  it("returns PARTIAL with pendingCountForMe when I give more than I receive", () => {
    const result = determineExchangeType(
      ["ARG10", "URU4", "ESP7"],
      ["BRA5"],
      status(),
      status(),
      "sofi"
    );

    assert.equal(result.type, "PARTIAL");
    assert.equal(result.pendingCountForMe, 2);
    assert.equal(result.pendingCountForOther, 0);
  });

  it("returns PARTIAL with pendingCountForOther when I receive more than I give", () => {
    const result = determineExchangeType(
      ["ARG10"],
      ["BRA5", "FRA8", "GER3"],
      status(),
      status(),
      "sofi"
    );

    assert.equal(result.type, "PARTIAL");
    assert.equal(result.pendingCountForMe, 0);
    assert.equal(result.pendingCountForOther, 2);
  });

  it("returns PENDING when other user has no repeated stickers loaded", () => {
    const result = determineExchangeType(
      ["ARG10", "URU4"],
      [],
      status(),
      status({ hasRepeatedStickers: false }),
      "sofi"
    );

    assert.equal(result.type, "PENDING");
    assert.equal(result.pendingCountForMe, 2);
  });

  it("calculates canReceive from repeated stickers even when mine is untracked", () => {
    const myStickers = [sticker("1", "ARG10", 0, 0, false)];
    const otherStickers = [sticker("1", "ARG10", 1, 1, true)];

    assert.deepEqual(computeCanReceive(myStickers, otherStickers), ["ARG10"]);
  });

  it("returns PARTIAL when other has repeated stickers and I can receive without tracking missing", () => {
    const analysis = analyzeExchange({
      me: {
        userId: "me",
        userName: "aldiluqui",
        stickers: []
      },
      other: {
        userId: "sofi",
        userName: "sofi",
        stickers: [sticker("1", "COL1", 1, 1, true), sticker("2", "COL2", 1, 1, true)]
      }
    });

    assert.deepEqual(analysis.canReceive, ["COL1", "COL2"]);
    assert.equal(analysis.type, "PARTIAL");
    assert.equal(analysis.pendingCountForOther, 2);
  });

  it("returns NOT_AVAILABLE when there are no matches", () => {
    const result = determineExchangeType([], [], status(), status(), "sofi");

    assert.equal(result.type, "NOT_AVAILABLE");
  });

  it("analyzes Sofi partial exchange scenario", () => {
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
    assert.equal(analysis.type, "PARTIAL");
    assert.equal(analysis.pendingCountForMe, 0);
    assert.equal(analysis.pendingCountForOther, 1);
  });

  it("analyzes pending exchange when other has missing but no repeated", () => {
    const analysis = analyzeExchange({
      me: {
        userId: "me",
        userName: "aldiluqui",
        stickers: [
          sticker("1", "ARG12", 1, 1, true),
          sticker("2", "ESP7", 1, 1, true),
          sticker("3", "CC3", 1, 1, true)
        ]
      },
      other: {
        userId: "sofi",
        userName: "sofi",
        stickers: [
          sticker("1", "ARG12", 0, 0, true),
          sticker("2", "ESP7", 0, 0, true),
          sticker("3", "CC3", 0, 0, true)
        ]
      }
    });

    assert.equal(analysis.type, "PENDING");
    assert.equal(analysis.canGive.length, 3);
    assert.equal(analysis.canReceive.length, 0);
    assert.equal(analysis.pendingCountForMe, 3);
    assert.equal(analysis.suggestions.length, 3);
    assert.deepEqual(
      analysis.suggestions.map((suggestion) => suggestion.give),
      ["ARG12", "ESP7", "CC3"]
    );
  });

  it("suggests pending partial exchange when other has no album loaded", () => {
    const analysis = analyzeExchange({
      me: {
        userId: "me",
        userName: "aldiluqui",
        stickers: [sticker("1", "ARG12", 1, 1, true), sticker("2", "ESP7", 1, 1, true)]
      },
      other: {
        userId: "sofi",
        userName: "sofi",
        stickers: []
      }
    });

    assert.equal(analysis.type, "PENDING");
    assert.equal(analysis.canGive.length, 2);
    assert.equal(analysis.suggestions.length, 2);
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
