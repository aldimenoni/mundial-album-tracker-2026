import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, StickerType, type Prisma } from "@prisma/client";
import { config } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(currentDir, "../../../.env"), quiet: true });
config({ path: path.resolve(currentDir, "../.env"), override: true, quiet: true });

const prisma = new PrismaClient();

type TeamDefinition = {
  code: string;
  name: string;
};

const teams: TeamDefinition[] = [
  { code: "ALG", name: "Argelia" },
  { code: "ARG", name: "Argentina" },
  { code: "AUS", name: "Australia" },
  { code: "AUT", name: "Austria" },
  { code: "BEL", name: "Belgica" },
  { code: "BIH", name: "Bosnia y Herzegovina" },
  { code: "BRA", name: "Brasil" },
  { code: "CAN", name: "Canada" },
  { code: "CIV", name: "Costa de Marfil" },
  { code: "COD", name: "RD Congo" },
  { code: "COL", name: "Colombia" },
  { code: "CPV", name: "Cabo Verde" },
  { code: "CRO", name: "Croacia" },
  { code: "CUW", name: "Curazao" },
  { code: "CZE", name: "Chequia" },
  { code: "ECU", name: "Ecuador" },
  { code: "EGY", name: "Egipto" },
  { code: "ENG", name: "Inglaterra" },
  { code: "ESP", name: "España" },
  { code: "FRA", name: "Francia" },
  { code: "GER", name: "Alemania" },
  { code: "GHA", name: "Ghana" },
  { code: "HAI", name: "Haiti" },
  { code: "IRN", name: "Iran" },
  { code: "IRQ", name: "Irak" },
  { code: "JOR", name: "Jordania" },
  { code: "JPN", name: "Japon" },
  { code: "KOR", name: "Corea del Sur" },
  { code: "KSA", name: "Arabia Saudita" },
  { code: "MAR", name: "Marruecos" },
  { code: "MEX", name: "Mexico" },
  { code: "NED", name: "Paises Bajos" },
  { code: "NOR", name: "Noruega" },
  { code: "NZL", name: "Nueva Zelanda" },
  { code: "PAN", name: "Panama" },
  { code: "PAR", name: "Paraguay" },
  { code: "POR", name: "Portugal" },
  { code: "QAT", name: "Qatar" },
  { code: "RSA", name: "Sudafrica" },
  { code: "SCO", name: "Escocia" },
  { code: "SEN", name: "Senegal" },
  { code: "SUI", name: "Suiza" },
  { code: "SWE", name: "Suecia" },
  { code: "TUN", name: "Tunez" },
  { code: "TUR", name: "Turquia" },
  { code: "URU", name: "Uruguay" },
  { code: "USA", name: "Estados Unidos" },
  { code: "UZB", name: "Uzbekistan" }
];

const worldCupHistory = [
  "Official Emblem",
  "Official Emblem",
  "Official Mascots",
  "Official Slogan",
  "Official Ball",
  "Canada - Host Countries & Cities",
  "Mexico - Host Countries & Cities",
  "USA - Host Countries & Cities",
  "Italy 1934 - World Cup History",
  "Uruguay 1950 - World Cup History",
  "West Germany 1954 - World Cup History",
  "Brazil 1962 - World Cup History",
  "West Germany 1974 - World Cup History",
  "Argentina 1986 - World Cup History",
  "Brazil 1994 - World Cup History",
  "Brazil 2002 - World Cup History",
  "Italy 2006 - World Cup History",
  "Germany 2014 - World Cup History",
  "Argentina 2022 - World Cup History"
];

const cocaColaPlayers = [
  "Lamine Yamal",
  "Joshua Kimmich",
  "Virgil van Dijk",
  "Antonee Robinson",
  "Alphonso Davies",
  "Lautaro Martinez",
  "Harry Kane",
  "Edson Alvarez",
  "Weston McKennie",
  "Jefferson Lerma",
  "Santiago Gimenez",
  "Gabriel Magalhaes"
];

function teamStickerName(teamName: string, number: number): string | null {
  if (number === 1) {
    return "Escudo";
  }

  if (number === 13) {
    return "Foto del equipo";
  }

  return `Jugador ${teamName} ${number}`;
}

function buildStickerSeed(): Prisma.StickerCreateManyInput[] {
  let orderIndex = 1;
  const stickers: Prisma.StickerCreateManyInput[] = [
    {
      code: "PANINI00",
      number: 0,
      team: null,
      playerName: "Panini Logo - We Are Panini",
      type: StickerType.SPECIAL,
      section: "Panini",
      orderIndex: orderIndex++
    }
  ];

  for (const [index, name] of worldCupHistory.entries()) {
    const number = index + 1;
    stickers.push({
      code: `FWC${number}`,
      number,
      team: null,
      playerName: name,
      type: StickerType.SPECIAL,
      section: "World Cup History",
      orderIndex: orderIndex++
    });
  }

  for (const team of teams) {
    for (let number = 1; number <= 20; number += 1) {
      stickers.push({
        code: `${team.code}${number}`,
        number,
        team: team.name,
        playerName: teamStickerName(team.name, number),
        type: StickerType.STANDARD,
        section: team.name,
        orderIndex: orderIndex++
      });
    }
  }

  for (const [index, playerName] of cocaColaPlayers.entries()) {
    const number = index + 1;
    stickers.push({
      code: `CC${number}`,
      number,
      team: "Coca-Cola",
      playerName,
      type: StickerType.COCA_COLA,
      section: "Coca-Cola",
      orderIndex: orderIndex++
    });
  }

  return stickers;
}

async function main(): Promise<void> {
  const stickers = buildStickerSeed();

  await prisma.userSticker.deleteMany();
  await prisma.sticker.deleteMany();

  await prisma.sticker.createMany({
    data: stickers,
    skipDuplicates: true
  });

  console.log(`Seed completed with ${stickers.length} stickers.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
