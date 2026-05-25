import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { StickerMissingUsersDto } from "@mundial-album/shared";

describe("findUsersMissingSticker result shape", () => {
  it("marks users without owned quantity as missing", () => {
    const ownedUserIds = new Set(["user-a"]);
    const users = [
      { id: "user-a", name: "alice", createdAt: new Date(), updatedAt: new Date() },
      { id: "user-b", name: "bob", createdAt: new Date(), updatedAt: new Date() }
    ];

    const missingUsers = users
      .filter((user) => !ownedUserIds.has(user.id))
      .map((user) => ({
        user: {
          id: user.id,
          name: user.name,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        },
        quantityOwned: 0
      }));

    const result: StickerMissingUsersDto = {
      sticker: {
        id: "sticker-1",
        code: "ARG10",
        number: 10,
        team: "Argentina",
        playerName: "Messi",
        type: "STANDARD",
        section: null,
        orderIndex: 1
      },
      users: missingUsers
    };

    assert.equal(result.users.length, 1);
    assert.equal(result.users[0]?.user.name, "bob");
    assert.equal(result.users[0]?.quantityOwned, 0);
  });
});
