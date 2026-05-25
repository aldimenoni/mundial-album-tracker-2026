import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatAlbumPageRange,
  formatStickerAlbumLocation,
  getSpreadAlbumPageRange,
  getStickerAlbumPage,
  getTeamAlbumPageStartByCode
} from "./album-page-numbers.js";

describe("album page numbers", () => {
  it("uses the official Panini menu page starts by World Cup group", () => {
    const pageStarts = getTeamAlbumPageStartByCode();

    assert.equal(pageStarts.get("MEX"), 8);
    assert.equal(pageStarts.get("RSA"), 10);
    assert.equal(pageStarts.get("BEL"), 58);
    assert.equal(pageStarts.get("PAN"), 104);
  });

  it("maps opening and history stickers to their album pages", () => {
    assert.equal(getStickerAlbumPage({ code: "PANINI00", number: 0, section: "Panini", team: null }), 1);
    assert.equal(getStickerAlbumPage({ code: "FWC1", number: 1, section: "World Cup History", team: null }), 1);
    assert.equal(getStickerAlbumPage({ code: "FWC8", number: 8, section: "World Cup History", team: null }), 3);
    assert.equal(getStickerAlbumPage({ code: "FWC19", number: 19, section: "World Cup History", team: null }), 109);
    assert.equal(getStickerAlbumPage({ code: "CC1", number: 1, section: "Coca-Cola", team: "Coca-Cola" }), null);
  });

  it("maps team stickers to their two-page spreads", () => {
    assert.equal(getStickerAlbumPage({ code: "MEX1", number: 1, section: "Mexico", team: "Mexico" }), 8);
    assert.equal(getStickerAlbumPage({ code: "MEX15", number: 15, section: "Mexico", team: "Mexico" }), 9);
    assert.equal(getStickerAlbumPage({ code: "ARG17", number: 17, section: "Argentina", team: "Argentina" }), 83);
  });

  it("formats search labels and spread headers", () => {
    assert.equal(
      formatStickerAlbumLocation({ code: "MEX10", number: 10, section: "Mexico", team: "Mexico" }),
      "Pág. 8 · Mexico"
    );

    const historia1Range = getSpreadAlbumPageRange({ id: "historia-1", title: "Historia del Mundial" });
    const historia2Range = getSpreadAlbumPageRange({ id: "historia-2", title: "Historia del Mundial" });
    const mexicoRange = getSpreadAlbumPageRange({ id: "mexico", title: "Mexico", team: "Mexico" });

    assert.ok(historia1Range);
    assert.ok(historia2Range);
    assert.ok(mexicoRange);

    assert.equal(formatAlbumPageRange(historia1Range), "Pág. 1-3");
    assert.equal(formatAlbumPageRange(historia2Range), "Pág. 106-109");
    assert.equal(getSpreadAlbumPageRange({ id: "coca-cola", title: "Coca-Cola" }), null);
    assert.equal(
      formatStickerAlbumLocation({ code: "CC1", number: 1, section: "Coca-Cola", team: "Coca-Cola" }),
      "Coca-Cola"
    );
    assert.equal(formatAlbumPageRange(mexicoRange), "Pág. 8-9");
  });
});
