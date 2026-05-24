import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(currentDir, "../../../.env"), quiet: true });
config({ path: path.resolve(currentDir, "../.env"), override: true, quiet: true });

const prisma = new PrismaClient();

const USERNAME = "aldiluqui";
const CSV_PATH =
  process.argv[2] ?? "/Users/aldanamenoni/Downloads/repetidas.csv";

const PREFIX_ALIASES: Record<string, string> = {
  OAT: "QAT"
};

type RepeatedRow = {
  prefix: string;
  numbers: number[];
};

function parseNumbers(raw: string): number[] {
  return raw
    .split(",")
    .map((value) => value.trim())
    .map((value) => value.replace(/^-+(?=\d)/, ""))
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function parseRepeatedCsv(content: string): RepeatedRow[] {
  const rows: RepeatedRow[] = [];

  for (const rawLine of content.trim().split("\n").slice(1)) {
    const line = rawLine.replace(/\r$/, "").trim();

    if (!line) {
      continue;
    }

    const match = line.match(/^([^,]+),("([^"]*)"|([^,]*)),/);

    if (!match) {
      console.warn(`Linea omitida: ${line}`);
      continue;
    }

    const prefix = (PREFIX_ALIASES[match[1]?.trim() ?? ""] ?? match[1]?.trim() ?? "").toUpperCase();
    const numbersRaw = match[3] ?? match[4] ?? "";

    if (!prefix || !numbersRaw) {
      console.warn(`Linea incompleta: ${line}`);
      continue;
    }

    rows.push({
      prefix,
      numbers: parseNumbers(numbersRaw)
    });
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

  const user = await prisma.user.findUnique({ where: { name: USERNAME } });

  if (!user) {
    throw new Error(`Usuario no encontrado: ${USERNAME}`);
  }

  const csvRows = parseRepeatedCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const repeatCounts = new Map<string, number>();

  for (const row of csvRows) {
    const frequency = new Map<number, number>();

    for (const number of row.numbers) {
      frequency.set(number, (frequency.get(number) ?? 0) + 1);
    }

    for (const [number, count] of frequency) {
      const code = buildStickerCode(row.prefix, number);
      repeatCounts.set(code, Math.max(repeatCounts.get(code) ?? 0, count));
    }
  }

  const stickers = await prisma.sticker.findMany({
    select: { id: true, code: true }
  });
  const stickerByCode = new Map(stickers.map((sticker) => [sticker.code, sticker.id]));

  let upserted = 0;
  let skipped = 0;
  let totalRepeated = 0;

  for (const [code, quantityRepeated] of repeatCounts) {
    const stickerId = stickerByCode.get(code);

    if (!stickerId) {
      skipped += 1;
      console.warn(`Figurita no encontrada en catalogo: ${code}`);
      continue;
    }

    const existing = await prisma.userSticker.findUnique({
      where: {
        userId_stickerId: {
          userId: user.id,
          stickerId
        }
      }
    });

    const quantityOwned = existing?.quantityOwned ?? 0;

    await prisma.userSticker.upsert({
      where: {
        userId_stickerId: {
          userId: user.id,
          stickerId
        }
      },
      update: {
        quantityOwned,
        quantityRepeated
      },
      create: {
        userId: user.id,
        stickerId,
        quantityOwned,
        quantityRepeated
      }
    });

    upserted += 1;
    totalRepeated += quantityRepeated;
  }

  console.log(`Repetidas importadas para @${USERNAME}`);
  console.log(`- Figuritas con repetidas: ${upserted}`);
  console.log(`- Total unidades repetidas: ${totalRepeated}`);
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
