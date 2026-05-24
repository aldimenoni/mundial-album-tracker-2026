import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(currentDir, "../../../.env"), quiet: true });
config({ path: path.resolve(currentDir, "../.env"), override: true, quiet: true });

const prisma = new PrismaClient();

const USER_A = "intercambio_mucho_a";
const USER_B = "intercambio_mucho_b";

/** A da repetidas de Argentina/Mexico/España que le faltan a B */
const A_GIVES = [
  "ARG1",
  "ARG2",
  "ARG3",
  "ARG4",
  "ARG5",
  "ARG6",
  "MEX1",
  "MEX2",
  "MEX3",
  "ESP1",
  "ESP2",
  "FRA1"
] as const;

/** B da repetidas de Brasil/Colombia/Alemania que le faltan a A */
const B_GIVES = [
  "BRA1",
  "BRA2",
  "BRA3",
  "BRA4",
  "BRA5",
  "BRA6",
  "COL1",
  "COL2",
  "COL3",
  "GER1",
  "GER2",
  "URU1"
] as const;

const A_OWNED_BASE = ["ARG7", "ARG8", "MEX4", "MEX5", "ESP3"];
const B_OWNED_BASE = ["BRA7", "BRA8", "COL4", "COL5", "GER3"];

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

async function applyScenario(
  userId: string,
  options: {
    owned: string[];
    missing: string[];
    repeated: string[];
  },
  stickersByCode: Map<string, string>
): Promise<void> {
  for (const code of options.owned) {
    const stickerId = stickersByCode.get(code);

    if (!stickerId) {
      throw new Error(`No se encontró la figurita ${code}`);
    }

    await upsertUserSticker(userId, stickerId, 1, 0);
  }

  for (const code of options.missing) {
    const stickerId = stickersByCode.get(code);

    if (!stickerId) {
      throw new Error(`No se encontró la figurita ${code}`);
    }

    await upsertUserSticker(userId, stickerId, 0, 0);
  }

  for (const code of options.repeated) {
    const stickerId = stickersByCode.get(code);

    if (!stickerId) {
      throw new Error(`No se encontró la figurita ${code}`);
    }

    await upsertUserSticker(userId, stickerId, 1, 1);
  }
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

  const userA = await prisma.user.upsert({
    where: { name: USER_A },
    update: {},
    create: { name: USER_A }
  });

  const userB = await prisma.user.upsert({
    where: { name: USER_B },
    update: {},
    create: { name: USER_B }
  });

  await applyScenario(
    userA.id,
    {
      owned: [...A_OWNED_BASE],
      missing: [...B_GIVES],
      repeated: [...A_GIVES]
    },
    stickersByCode
  );

  await applyScenario(
    userB.id,
    {
      owned: [...B_OWNED_BASE],
      missing: [...A_GIVES],
      repeated: [...B_GIVES]
    },
    stickersByCode
  );

  const pairCount = Math.min(A_GIVES.length, B_GIVES.length);

  console.log("Caso de prueba con muchas figuritas listo.");
  console.log("");
  console.log(`Usuarios: ${USER_A} y ${USER_B}`);
  console.log(`Intercambio múltiple: ${pairCount} pares`);
  console.log("");
  console.log(`${USER_A} da: ${A_GIVES.join(", ")}`);
  console.log(`${USER_A} recibe: ${B_GIVES.join(", ")}`);
  console.log("");
  console.log("Probá en la app:");
  console.log(`1. Entrá como ${USER_A}`);
  console.log("2. Andá a Intercambio");
  console.log(`3. Abrí la tarjeta con @${USER_B}`);
  console.log("4. Deslizá la lista de cambios sugeridos para ver todos los pares");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
