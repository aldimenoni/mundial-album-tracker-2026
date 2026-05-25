import type { AlbumSpreadDefinition } from "./album-pages.js";
import {
  COCA_COLA_FILTER_LABEL,
  HISTORY_1_FILTER_LABEL,
  HISTORY_2_FILTER_LABEL,
  WORLD_CUP_GROUPS
} from "./album-pages.js";
import type { StickerDto } from "./index.js";
import { getTeamDisplayLabel } from "./team-themes.js";

const TEAM_ALBUM_PAGES = 2;
const HISTORY_1_PAGE_START = 1;
const HISTORY_1_PAGE_END = 3;
const HISTORY_1_STICKER_PAGES: Record<number, number> = {
  0: 1,
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 2,
  6: 3,
  7: 3,
  8: 3
};

function buildTeamPageStartByCode(): Map<string, number> {
  const pageStartByCode = new Map<string, number>();
  let page = 8;

  for (const group of WORLD_CUP_GROUPS) {
    for (const teamName of group.teams) {
      const code = getTeamCodeFromTeamName(teamName);

      if (code) {
        pageStartByCode.set(code, page);
      }

      page += TEAM_ALBUM_PAGES;
    }

    if (group.label === "Grupo F") {
      page += TEAM_ALBUM_PAGES;
    }
  }

  return pageStartByCode;
}

const TEAM_PAGE_START_BY_CODE = buildTeamPageStartByCode();
const HISTORY_2_PAGE_START = 106;
const HISTORY_2_PAGE_END = 109;

type AlbumPageRange = {
  start: number;
  end: number;
};

type StickerAlbumLocation = {
  start: number | null;
  end: number | null;
  sectionName: string;
};

function getTeamCodeFromStickerCode(code: string): string | null {
  const match = code.match(/^([A-Z]{3})\d+$/);
  return match?.[1] ?? null;
}

function getTeamCodeFromTeamName(teamName: string): string | null {
  const codeByTeamName: Record<string, string> = {
    Argelia: "ALG",
    Argentina: "ARG",
    Australia: "AUS",
    Austria: "AUT",
    Belgica: "BEL",
    "Bosnia y Herzegovina": "BIH",
    Brasil: "BRA",
    Canada: "CAN",
    "Costa de Marfil": "CIV",
    "RD Congo": "COD",
    Colombia: "COL",
    "Cabo Verde": "CPV",
    Croacia: "CRO",
    Curazao: "CUW",
    Chequia: "CZE",
    Ecuador: "ECU",
    Egipto: "EGY",
    Inglaterra: "ENG",
    España: "ESP",
    Francia: "FRA",
    Alemania: "GER",
    Ghana: "GHA",
    Haiti: "HAI",
    Iran: "IRN",
    Irak: "IRQ",
    Jordania: "JOR",
    Japon: "JPN",
    "Corea del Sur": "KOR",
    "Arabia Saudita": "KSA",
    Marruecos: "MAR",
    Mexico: "MEX",
    "Paises Bajos": "NED",
    Noruega: "NOR",
    "Nueva Zelanda": "NZL",
    Panama: "PAN",
    Paraguay: "PAR",
    Portugal: "POR",
    Qatar: "QAT",
    Sudafrica: "RSA",
    Escocia: "SCO",
    Senegal: "SEN",
    Suiza: "SUI",
    Suecia: "SWE",
    Tunez: "TUN",
    Turquia: "TUR",
    Uruguay: "URU",
    "Estados Unidos": "USA",
    Uzbekistan: "UZB"
  };

  return codeByTeamName[teamName] ?? null;
}

function getHistory2Page(number: number): number {
  if (number <= 11) {
    return 106;
  }

  if (number <= 14) {
    return 107;
  }

  if (number <= 17) {
    return 108;
  }

  return 109;
}

export function formatAlbumPageLabel(page: number): string {
  return `Pág. ${page}`;
}

export function formatAlbumPageRange(range: AlbumPageRange): string {
  if (range.start === range.end) {
    return formatAlbumPageLabel(range.start);
  }

  return `Pág. ${range.start}-${range.end}`;
}

export function getStickerAlbumSectionName(
  sticker: Pick<StickerDto, "team" | "section" | "number">
): string {
  if (sticker.section === "Panini") {
    return HISTORY_1_FILTER_LABEL;
  }

  if (sticker.section === "World Cup History") {
    const number = sticker.number ?? -1;
    return number <= 8 ? HISTORY_1_FILTER_LABEL : HISTORY_2_FILTER_LABEL;
  }

  if (sticker.section === "Coca-Cola" || sticker.team === "Coca-Cola") {
    return COCA_COLA_FILTER_LABEL;
  }

  if (sticker.team) {
    return getTeamDisplayLabel(sticker.team)?.spanish ?? sticker.team;
  }

  return sticker.section ?? "Album";
}

export function getSpreadAlbumPageRange(spread: AlbumSpreadDefinition): AlbumPageRange | null {
  if (spread.id === "historia-1") {
    return { start: HISTORY_1_PAGE_START, end: HISTORY_1_PAGE_END };
  }

  if (spread.id === "historia-2") {
    return { start: HISTORY_2_PAGE_START, end: HISTORY_2_PAGE_END };
  }

  if (spread.id === "coca-cola") {
    return null;
  }

  if (spread.team) {
    const teamCode = getTeamCodeFromTeamName(spread.team);
    const start = teamCode ? TEAM_PAGE_START_BY_CODE.get(teamCode) : undefined;

    if (start) {
      return { start, end: start + TEAM_ALBUM_PAGES - 1 };
    }
  }

  return { start: HISTORY_1_PAGE_START, end: HISTORY_1_PAGE_END };
}

export function getStickerAlbumPage(
  sticker: Pick<StickerDto, "code" | "number" | "section" | "team">
): number | null {
  if (sticker.section === "Panini") {
    return HISTORY_1_STICKER_PAGES[0] ?? HISTORY_1_PAGE_START;
  }

  if (sticker.section === "World Cup History") {
    const number = sticker.number ?? -1;

    if (number <= 8) {
      return HISTORY_1_STICKER_PAGES[number] ?? HISTORY_1_PAGE_START;
    }

    return getHistory2Page(number);
  }

  if (sticker.section === "Coca-Cola" || sticker.team === "Coca-Cola") {
    return null;
  }

  const teamCode = getTeamCodeFromStickerCode(sticker.code);
  const pageStart = teamCode ? TEAM_PAGE_START_BY_CODE.get(teamCode) : undefined;

  if (pageStart) {
    const stickerNumber = sticker.number ?? Number.parseInt(sticker.code.slice(-2), 10);

    return pageStart + (stickerNumber <= 10 ? 0 : 1);
  }

  return HISTORY_1_PAGE_START;
}

export function getStickerAlbumLocation(
  sticker: Pick<StickerDto, "code" | "number" | "section" | "team">
): StickerAlbumLocation {
  const page = getStickerAlbumPage(sticker);

  return {
    start: page,
    end: page,
    sectionName: getStickerAlbumSectionName(sticker)
  };
}

export function formatStickerAlbumLocation(
  sticker: Pick<StickerDto, "code" | "number" | "section" | "team">
): string {
  const location = getStickerAlbumLocation(sticker);

  if (location.start === null) {
    return location.sectionName;
  }

  return `${formatAlbumPageLabel(location.start)} · ${location.sectionName}`;
}

export function getTeamAlbumPageStartByCode(): ReadonlyMap<string, number> {
  return TEAM_PAGE_START_BY_CODE;
}
