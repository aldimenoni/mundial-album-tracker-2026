import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { buildJustinoMissingCodes } from "./justino-missing-data.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(currentDir, "../../../.env"), quiet: true });
config({ path: path.resolve(currentDir, "../.env"), override: true, quiet: true });

const prisma = new PrismaClient();

const USER_ID = "5e0cae63-da17-444e-b3e6-fcde8017228d";

async function main(): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: USER_ID } });

  if (!user) {
    throw new Error(`Usuario no encontrado: ${USER_ID}`);
  }

  const missingCodes = new Set(buildJustinoMissingCodes());
  const stickers = await prisma.sticker.findMany({
    select: { id: true, code: true }
  });

  let upserted = 0;

  for (const sticker of stickers) {
    if (missingCodes.has(sticker.code)) {
      continue;
    }

    const existing = await prisma.userSticker.findUnique({
      where: {
        userId_stickerId: {
          userId: USER_ID,
          stickerId: sticker.id
        }
      }
    });

    await prisma.userSticker.upsert({
      where: {
        userId_stickerId: {
          userId: USER_ID,
          stickerId: sticker.id
        }
      },
      update: {
        quantityOwned: Math.max(existing?.quantityOwned ?? 0, 1),
        quantityRepeated: existing?.quantityRepeated ?? 0
      },
      create: {
        userId: USER_ID,
        stickerId: sticker.id,
        quantityOwned: 1,
        quantityRepeated: 0
      }
    });

    upserted += 1;
  }

  const summary = await prisma.userSticker.groupBy({
    by: ["userId"],
    where: { userId: USER_ID },
    _count: { _all: true }
  });

  const missing = await prisma.userSticker.count({
    where: { userId: USER_ID, quantityOwned: 0, quantityRepeated: 0 }
  });
  const owned = await prisma.userSticker.count({
    where: { userId: USER_ID, quantityOwned: { gt: 0 } }
  });
  const repeated = await prisma.userSticker.count({
    where: { userId: USER_ID, quantityRepeated: { gt: 0 } }
  });

  console.log(`Pegadas importadas para @${user.name}: ${upserted}`);
  console.log({ tracked: summary[0]?._count._all ?? 0, missing, owned, repeated });
  console.log(`Completitud: ${((owned / stickers.length) * 100).toFixed(2)}%`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
