import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(currentDir, "../../../.env"), quiet: true });
config({ path: path.resolve(currentDir, "../.env"), override: true, quiet: true });

const prisma = new PrismaClient();

const USERNAME = (process.argv[2] ?? "aldiluqui").toLowerCase();
const CSV_PATH =
  process.argv[3] ??
  (USERNAME === "aldiluqui"
    ? "/Users/aldanamenoni/Downloads/faltantes album aldiluqui.csv"
    : `/Users/aldanamenoni/Downloads/faltantes album ${USERNAME}.csv`);

const PREFIX_RANGES: Record<string, number> = {
  FWC: 19
};

const DEFAULT_TEAM_RANGE = 20;

type CsvRow = {
  prefix: string;
  missingNumbers: number[];
};

function parseCsv(content: string): CsvRow[] {
  const rows: CsvRow[] = [];

  for (const rawLine of content.trim().split("\n").slice(1)) {
    const line = rawLine.replace(/\r$/, "");
    const match = line.match(/^[^,]+,([^,]+),"(.+)"\s*$/);

    if (!match) {
      throw new Error(`No se pudo parsear la linea CSV: ${line}`);
    }

    const prefix = match[1]?.trim();
    const numbersRaw = match[2]?.trim();

    if (!prefix || !numbersRaw) {
      throw new Error(`Linea CSV incompleta: ${line}`);
    }

    const missingNumbers = numbersRaw
      .split(",")
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isFinite(value));

    rows.push({ prefix, missingNumbers });
  }

  return rows;
}

function buildStickerCode(prefix: string, number: number): string {
  return `${prefix}${number}`;
}

async function main(): Promise<void> {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`No se encontro el CSV en: ${CSV_PATH}`);
  }

  const csvRows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const missingCodes = new Set<string>();

  for (const row of csvRows) {
    for (const number of row.missingNumbers) {
      missingCodes.add(buildStickerCode(row.prefix, number));
    }
  }

  let user = await prisma.user.findUnique({ where: { name: USERNAME } });

  if (!user) {
    user = await prisma.user.create({
      data: { name: USERNAME }
    });
    console.log(`Usuario creado: ${USERNAME}`);
  } else {
    console.log(`Usuario encontrado: ${USERNAME}`);
  }

  const stickers = await prisma.sticker.findMany({
    select: { id: true, code: true }
  });
  const stickerByCode = new Map(stickers.map((sticker) => [sticker.code, sticker.id]));

  const ownedCodes = new Set<string>();

  for (const row of csvRows) {
    const maxNumber = PREFIX_RANGES[row.prefix] ?? DEFAULT_TEAM_RANGE;

    for (let number = 1; number <= maxNumber; number += 1) {
      const code = buildStickerCode(row.prefix, number);

      if (!missingCodes.has(code)) {
        ownedCodes.add(code);
      }
    }
  }

  const codesToImport = new Set([...missingCodes, ...ownedCodes]);
  let upserted = 0;
  let skipped = 0;

  for (const code of codesToImport) {
    const stickerId = stickerByCode.get(code);

    if (!stickerId) {
      skipped += 1;
      console.warn(`Figurita no encontrada en catalogo: ${code}`);
      continue;
    }

    const isOwned = ownedCodes.has(code);

    await prisma.userSticker.upsert({
      where: {
        userId_stickerId: {
          userId: user.id,
          stickerId
        }
      },
      update: {
        quantityOwned: isOwned ? 1 : 0,
        quantityRepeated: 0
      },
      create: {
        userId: user.id,
        stickerId,
        quantityOwned: isOwned ? 1 : 0,
        quantityRepeated: 0
      }
    });

    upserted += 1;
  }

  console.log(`Importacion completada para @${USERNAME}`);
  console.log(`- Faltantes: ${missingCodes.size}`);
  console.log(`- Pegadas: ${ownedCodes.size}`);
  console.log(`- Registros upsert: ${upserted}`);
  console.log(`- Codigos sin match en catalogo: ${skipped}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
