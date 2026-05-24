import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, StickerType } from "@prisma/client";
import { config } from "dotenv";
import { playerNameForTeamSticker } from "./player-rosters.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(currentDir, "../../../.env"), quiet: true });
config({ path: path.resolve(currentDir, "../.env"), override: true, quiet: true });

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const teamStickers = await prisma.sticker.findMany({
    where: { type: StickerType.STANDARD },
    select: { id: true, code: true }
  });

  let updated = 0;

  for (const sticker of teamStickers) {
    const match = sticker.code.match(/^([A-Z]{3})(\d+)$/);
    if (!match) {
      continue;
    }

    const [, teamCode, numberText] = match;
    const playerName = playerNameForTeamSticker(teamCode, Number(numberText));

    if (!playerName) {
      continue;
    }

    await prisma.sticker.update({
      where: { id: sticker.id },
      data: { playerName }
    });
    updated += 1;
  }

  console.log(`Updated ${updated} team sticker names.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
