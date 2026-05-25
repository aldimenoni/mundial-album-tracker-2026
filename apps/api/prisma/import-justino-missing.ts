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

  const missingCodes = buildJustinoMissingCodes();
  const stickers = await prisma.sticker.findMany({
    select: { id: true, code: true }
  });
  const stickerByCode = new Map(stickers.map((sticker) => [sticker.code, sticker.id]));

  const existingRows = await prisma.userSticker.findMany({
    where: { userId: USER_ID },
    select: { stickerId: true, quantityOwned: true, quantityRepeated: true }
  });
  const existingByStickerId = new Map(existingRows.map((row) => [row.stickerId, row]));

  let upserted = 0;
  let skippedCatalog = 0;
  let skippedRepeated = 0;

  for (const code of missingCodes) {
    const stickerId = stickerByCode.get(code);

    if (!stickerId) {
      skippedCatalog += 1;
      console.warn(`Sin match en catalogo: ${code}`);
      continue;
    }

    const existing = existingByStickerId.get(stickerId);

    if ((existing?.quantityRepeated ?? 0) > 0) {
      skippedRepeated += 1;
      console.log(`Conservada repetida: ${code}`);
      continue;
    }

    await prisma.userSticker.upsert({
      where: {
        userId_stickerId: {
          userId: USER_ID,
          stickerId
        }
      },
      update: {
        quantityOwned: 0,
        quantityRepeated: 0
      },
      create: {
        userId: USER_ID,
        stickerId,
        quantityOwned: 0,
        quantityRepeated: 0
      }
    });

    upserted += 1;
  }

  console.log(`Importacion de faltantes para @${user.name}`);
  console.log(`- Codigos en lista: ${missingCodes.length}`);
  console.log(`- Faltantes cargadas: ${upserted}`);
  console.log(`- Repetidas preservadas: ${skippedRepeated}`);
  console.log(`- Sin match en catalogo: ${skippedCatalog}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
