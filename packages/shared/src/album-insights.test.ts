import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAlbumSpreadProgress, buildLegendaryMedals } from "./album-insights.js";
import type { UserStickerDto } from "./index.js";

function sticker(
  code: string,
  team: string | null,
  section: string | null,
  number: number | null,
  owned: number
): UserStickerDto {
  return {
    id: owned > 0 ? `row-${code}` : null,
    stickerId: `id-${code}`,
    status: owned > 0 ? "owned" : "missing",
    quantityOwned: owned,
    quantityRepeated: 0,
    sticker: {
      id: `id-${code}`,
      code,
      number,
      team,
      playerName: null,
      type: "STANDARD",
      section,
      orderIndex: number ?? 0
    }
  };
}

describe("album insights", () => {
  it("orders spreads by fewest missing stickers first", () => {
    const stickers: UserStickerDto[] = [
      ...Array.from({ length: 18 }, (_, index) =>
        sticker(`FWC${index + 1}`, null, "World Cup History", index + 1, 1)
      ),
      ...Array.from({ length: 20 }, (_, index) =>
        sticker(`ARG${index + 1}`, "Argentina", "Argentina", index + 1, index < 18 ? 1 : 0)
      ),
      ...Array.from({ length: 20 }, (_, index) =>
        sticker(`BRA${index + 1}`, "Brasil", "Brasil", index + 1, index < 10 ? 1 : 0)
      )
    ];

    const progress = buildAlbumSpreadProgress(stickers);
    const argentina = progress.find((item) => item.spreadId === "argentina");
    const brasil = progress.find((item) => item.spreadId === "brasil");

    assert.ok(argentina);
    assert.ok(brasil);
    assert.equal(argentina.missing, 2);
    assert.equal(brasil.missing, 10);
    assert.ok(progress.indexOf(argentina) < progress.indexOf(brasil));
  });

  it("marks legendary medals as earned when owned", () => {
    const medals = buildLegendaryMedals([
      sticker("ARG17", "Argentina", "Argentina", 17, 1),
      sticker("FRA20", "Francia", "Francia", 20, 0)
    ]);

    assert.equal(medals.find((medal) => medal.id === "messi")?.earned, true);
    assert.equal(medals.find((medal) => medal.id === "mbappe")?.earned, false);
  });
});
