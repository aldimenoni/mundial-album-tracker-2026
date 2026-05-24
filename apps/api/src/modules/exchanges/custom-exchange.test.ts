import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AlbumDto } from "@mundial-album/shared";
import {
  classifyCustomExchangeType,
  computeCustomPendingCounts,
  validateCustomSelection
} from "./custom-exchange.js";

function album(userId: string, name: string, stickers: AlbumDto["stickers"]): AlbumDto {
  return {
    user: {
      id: userId,
      name,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    },
    stickers
  };
}

function stickerItem(
  code: string,
  quantityOwned: number,
  quantityRepeated: number
): AlbumDto["stickers"][number] {
  return {
    id: `us-${code}`,
    stickerId: `st-${code}`,
    status: quantityRepeated > 0 ? "repeated" : quantityOwned > 0 ? "owned" : "missing",
    quantityOwned,
    quantityRepeated,
    sticker: {
      id: `st-${code}`,
      code,
      number: null,
      team: null,
      playerName: code,
      type: "STANDARD",
      section: null,
      orderIndex: 0
    }
  };
}

describe("custom-exchange", () => {
  it("classifies balanced custom trades", () => {
    assert.equal(classifyCustomExchangeType(1, 1), "DIRECT");
    assert.equal(classifyCustomExchangeType(2, 2), "MULTIPLE");
  });

  it("classifies unbalanced custom trades", () => {
    assert.equal(classifyCustomExchangeType(2, 1), "PARTIAL");
    assert.equal(classifyCustomExchangeType(0, 2), "PARTIAL");
    assert.equal(classifyCustomExchangeType(3, 0), "PENDING");
  });

  it("computes pending counts from custom selection", () => {
    assert.deepEqual(computeCustomPendingCounts(3, 1), {
      pendingCountForMe: 2,
      pendingCountForOther: 0
    });
    assert.deepEqual(computeCustomPendingCounts(1, 2), {
      pendingCountForMe: 0,
      pendingCountForOther: 1
    });
  });

  it("validates repeated availability for custom selection", () => {
    const myAlbum = album("me", "me", [
      stickerItem("ARG10", 1, 2),
      stickerItem("BRA5", 0, 0)
    ]);
    const otherAlbum = album("other", "other", [
      stickerItem("ARG10", 0, 0),
      stickerItem("ESP7", 0, 1)
    ]);

    assert.doesNotThrow(() =>
      validateCustomSelection(myAlbum, otherAlbum, {
        stickersGivenByMe: ["ARG10"],
        stickersGivenByOther: ["ESP7"]
      })
    );

    assert.throws(
      () =>
        validateCustomSelection(myAlbum, otherAlbum, {
          stickersGivenByMe: ["BRA5"],
          stickersGivenByOther: []
        }),
      /No tenés repetida disponible/
    );

    assert.throws(
      () =>
        validateCustomSelection(myAlbum, otherAlbum, {
          stickersGivenByMe: [],
          stickersGivenByOther: ["ARG10"]
        }),
      /no tiene repetida disponible/
    );
  });
});
