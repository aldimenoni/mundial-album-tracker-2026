import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(currentDir, "../../../.env"), quiet: true });
config({ path: path.resolve(currentDir, "../.env"), override: true, quiet: true });

const prisma = new PrismaClient();

const DEMO_USERS = ["intercambio_a", "intercambio_b"] as const;

const EXCHANGE_SCENARIO: Record<
  (typeof DEMO_USERS)[number],
  { repeated: string[]; missing: string[]; ownedSamples: string[] }
> = {
  intercambio_a: {
    repeated: ["ARG10"],
    missing: ["BRA5"],
    ownedSamples: ["ARG1", "ARG2", "MEX1", "MEX2"]
  },
  intercambio_b: {
    repeated: ["BRA5"],
    missing: ["ARG10"],
    ownedSamples: ["BRA1", "BRA2", "MEX3", "MEX4"]
  }
};

async function upsertUserSticker(
  userId: string,
  stickerId: string,
  quantityOwned: number,
  quantityRepeated: number
): Promise<void> {
  await prisma.userSticker.upsert({
    where: {
      userId_stickerId: {
        userId,
        stickerId
      }
    },
    update: {
      quantityOwned,
      quantityRepeated
    },
    create: {
      userId,
      stickerId,
      quantityOwned,
      quantityRepeated
    }
  });
}

async function main(): Promise<void> {
  const stickerCount = await prisma.sticker.count();

  if (stickerCount === 0) {
    throw new Error("No hay figuritas en la base. Corré primero: npm run seed");
  }

  const stickersByCode = new Map(
    (await prisma.sticker.findMany({ select: { id: true, code: true } })).map((sticker) => [
      sticker.code,
      sticker.id
    ])
  );

  for (const username of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { name: username },
      update: {},
      create: { name: username }
    });
    const scenario = EXCHANGE_SCENARIO[username];

    for (const code of scenario.ownedSamples) {
      const stickerId = stickersByCode.get(code);

      if (!stickerId) {
        throw new Error(`No se encontró la figurita ${code}`);
      }

      await upsertUserSticker(user.id, stickerId, 1, 0);
    }

    for (const code of scenario.missing) {
      const stickerId = stickersByCode.get(code);

      if (!stickerId) {
        throw new Error(`No se encontró la figurita ${code}`);
      }

      await upsertUserSticker(user.id, stickerId, 0, 0);
    }

    for (const code of scenario.repeated) {
      const stickerId = stickersByCode.get(code);

      if (!stickerId) {
        throw new Error(`No se encontró la figurita ${code}`);
      }

      await upsertUserSticker(user.id, stickerId, 1, 1);
    }
  }

  console.log("Caso de prueba de intercambio listo.");
  console.log("");
  console.log("Usuarios:");
  console.log("- intercambio_a: repetida ARG10, falta BRA5");
  console.log("- intercambio_b: repetida BRA5, falta ARG10");
  console.log("");
  console.log("Probá en la app:");
  console.log("1. Entrá como intercambio_a");
  console.log("2. Andá a Intercambio y confirmá el cambio con intercambio_b");
  console.log("3. Confirmá el intercambio directo ARG10 ↔ BRA5");
  console.log("4. Revisá álbum y estadísticas de ambos usuarios");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
