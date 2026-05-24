import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(currentDir, "../../../.env"), quiet: true });
config({ path: path.resolve(currentDir, "../.env"), override: true, quiet: true });

const prisma = new PrismaClient();

const KEEP_USERS = ["vicente", "aldiluqui", "alfo"] as const;

async function main(): Promise<void> {
  const keepUsersLower = new Set(KEEP_USERS.map((name) => name.toLowerCase()));
  const allUsers = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  const toDelete = allUsers.filter((user) => !keepUsersLower.has(user.name.toLowerCase()));
  const kept = allUsers.filter((user) => keepUsersLower.has(user.name.toLowerCase()));

  if (toDelete.length === 0) {
    console.log("No hay usuarios de prueba para eliminar.");
    console.log("Usuarios actuales:", kept.map((user) => user.name).join(", ") || "(ninguno)");
    return;
  }

  const deletedExchanges = await prisma.exchangeProposal.deleteMany({
    where: {
      OR: [
        { fromUserId: { in: toDelete.map((user) => user.id) } },
        { toUserId: { in: toDelete.map((user) => user.id) } }
      ]
    }
  });

  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { in: toDelete.map((user) => user.id) }
    }
  });

  console.log(`Eliminados ${deletedUsers.count} usuario(s) de prueba.`);
  console.log(`Eliminados ${deletedExchanges.count} intercambio(s) asociados.`);
  console.log("");
  console.log("Usuarios eliminados:");
  for (const user of toDelete) {
    console.log(`- ${user.name}`);
  }
  console.log("");
  console.log("Usuarios conservados:");
  for (const name of KEEP_USERS) {
    const found = kept.find((user) => user.name.toLowerCase() === name);
    console.log(found ? `- ${found.name}` : `- ${name} (no existía en la base)`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
