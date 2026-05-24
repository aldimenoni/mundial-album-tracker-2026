import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(currentDir, "../../../.env"), quiet: true });
config({ path: path.resolve(currentDir, "../.env"), override: true, quiet: true });

const prisma = new PrismaClient();

const USER_A = "intercambio_parcial_a";
const USER_B = "intercambio_parcial_b";

const A_GIVES = ["ARG1", "ARG2", "ARG3"] as const;
const B_GIVES = ["BRA1"] as const;

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

  for (const code of ["ARG4", "ARG5", "MEX1", "MEX2"]) {
    const stickerId = stickersByCode.get(code);

    if (!stickerId) {
      throw new Error(`No se encontró la figurita ${code}`);
    }

    await upsertUserSticker(userA.id, stickerId, 1, 0);
  }

  for (const code of ["BRA2", "BRA3", "COL1"]) {
    const stickerId = stickersByCode.get(code);

    if (!stickerId) {
      throw new Error(`No se encontró la figurita ${code}`);
    }

    await upsertUserSticker(userB.id, stickerId, 1, 0);
  }

  for (const code of A_GIVES) {
    const stickerId = stickersByCode.get(code);

    if (!stickerId) {
      throw new Error(`No se encontró la figurita ${code}`);
    }

    await upsertUserSticker(userA.id, stickerId, 1, 1);
  }

  for (const code of B_GIVES) {
    const stickerId = stickersByCode.get(code);

    if (!stickerId) {
      throw new Error(`No se encontró la figurita ${code}`);
    }

    await upsertUserSticker(userB.id, stickerId, 1, 1);
  }

  for (const code of B_GIVES) {
    const stickerId = stickersByCode.get(code);

    if (!stickerId) {
      throw new Error(`No se encontró la figurita ${code}`);
    }

    await upsertUserSticker(userA.id, stickerId, 0, 0);
  }

  for (const code of A_GIVES) {
    const stickerId = stickersByCode.get(code);

    if (!stickerId) {
      throw new Error(`No se encontró la figurita ${code}`);
    }

    await upsertUserSticker(userB.id, stickerId, 0, 0);
  }

  console.log("Caso de prueba parcial listo.");
  console.log("");
  console.log(`${USER_A}: repetidas ${A_GIVES.join(", ")} · falta ${B_GIVES.join(", ")}`);
  console.log(`${USER_B}: repetida ${B_GIVES.join(", ")} · faltan ${A_GIVES.join(", ")}`);
  console.log("");
  console.log("Flujo sugerido:");
  console.log(`1. Entrá como ${USER_A} y confirmá el intercambio parcial con ${USER_B}`);
  console.log("2. Verás 1 par confirmado y saldo pendiente de 2 figuritas");
  console.log(`3. Cargá repetidas en ${USER_B} (ej. COL1, COL2)`);
  console.log(`4. Entrá como ${USER_A} o ${USER_B} y confirmá de a una o todas`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
