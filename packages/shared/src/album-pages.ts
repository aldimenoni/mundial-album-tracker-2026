import type { UserStickerDto } from "./index.js";

export type AlbumSpreadDefinition = {
  id: string;
  title: string;
  filterLabel?: string;
  groupLabel?: string;
  sections?: string[];
  team?: string;
  includePanini?: boolean;
  historyNumbers?: { min: number; max: number };
  compact?: boolean;
};

const WORLD_CUP_GROUPS: Array<{ label: string; teams: string[] }> = [
  { label: "Grupo A", teams: ["Mexico", "Sudafrica", "Corea del Sur", "Chequia"] },
  { label: "Grupo B", teams: ["Canada", "Suiza", "Qatar", "Bosnia y Herzegovina"] },
  { label: "Grupo C", teams: ["Brasil", "Marruecos", "Escocia", "Haiti"] },
  { label: "Grupo D", teams: ["Estados Unidos", "Paraguay", "Australia", "Turquia"] },
  { label: "Grupo E", teams: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"] },
  { label: "Grupo F", teams: ["Paises Bajos", "Japon", "Suecia", "Tunez"] },
  { label: "Grupo G", teams: ["Belgica", "Egipto", "Iran", "Nueva Zelanda"] },
  { label: "Grupo H", teams: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"] },
  { label: "Grupo I", teams: ["Francia", "Senegal", "Irak", "Noruega"] },
  { label: "Grupo J", teams: ["Argentina", "Argelia", "Austria", "Jordania"] },
  { label: "Grupo K", teams: ["Portugal", "RD Congo", "Uzbekistan", "Colombia"] },
  { label: "Grupo L", teams: ["Inglaterra", "Croacia", "Ghana", "Panama"] }
];

const TEAM_SPREADS: AlbumSpreadDefinition[] = WORLD_CUP_GROUPS.flatMap((group) =>
  group.teams.map((team) => ({
    id: team.toLowerCase().replace(/\s+/g, "-"),
    title: team,
    groupLabel: group.label,
    team,
    compact: true
  }))
);

export const HISTORY_1_FILTER_LABEL = "Historia 1";
export const HISTORY_2_FILTER_LABEL = "Historia 2";
export const COCA_COLA_FILTER_LABEL = "Coca-Cola";

const SECTION_FILTER_LABELS = [
  HISTORY_1_FILTER_LABEL,
  HISTORY_2_FILTER_LABEL,
  COCA_COLA_FILTER_LABEL
] as const;

export type AlbumSpreadFilterGroups = {
  sections: string[];
  countries: string[];
};

function sortLabelsAlphabetically(labels: string[]): string[] {
  return [...labels].sort((left, right) =>
    left.localeCompare(right, "es", { sensitivity: "base" })
  );
}

export const ALBUM_SPREADS: AlbumSpreadDefinition[] = [
  {
    id: "historia-1",
    title: "Historia del Mundial",
    filterLabel: HISTORY_1_FILTER_LABEL,
    includePanini: true,
    historyNumbers: { min: 1, max: 8 },
    compact: true
  },
  ...TEAM_SPREADS,
  {
    id: "historia-2",
    title: "Historia del Mundial",
    filterLabel: HISTORY_2_FILTER_LABEL,
    historyNumbers: { min: 9, max: 19 },
    compact: true
  },
  {
    id: "coca-cola",
    title: "Coca-Cola",
    sections: ["Coca-Cola"],
    compact: true
  }
];

/** @deprecated Use HISTORY_1_FILTER_LABEL or HISTORY_2_FILTER_LABEL */
export const INTRO_SPREAD_FILTER_LABEL = HISTORY_1_FILTER_LABEL;

export function getAlbumTeamNames(): string[] {
  return getAlbumSpreadFilterGroups().countries;
}

export function getSpreadFilterValue(spread: AlbumSpreadDefinition): string {
  return spread.filterLabel ?? spread.team ?? spread.title;
}

export function getAlbumSpreadFilterGroups(): AlbumSpreadFilterGroups {
  const allOptions = ALBUM_SPREADS.map((spread) => getSpreadFilterValue(spread));
  const sectionSet = new Set<string>(SECTION_FILTER_LABELS);

  return {
    sections: SECTION_FILTER_LABELS.filter((label) => allOptions.includes(label)),
    countries: sortLabelsAlphabetically(allOptions.filter((option) => !sectionSet.has(option)))
  };
}

export function getAlbumSpreadFilterOptions(): string[] {
  const groups = getAlbumSpreadFilterGroups();
  return [...groups.sections, ...groups.countries];
}

export function getSpreadStickers(
  stickers: UserStickerDto[],
  spread: AlbumSpreadDefinition
): UserStickerDto[] {
  if (spread.historyNumbers) {
    const { min, max } = spread.historyNumbers;
    const filtered = stickers.filter((item) => {
      if (spread.includePanini && item.sticker.section === "Panini") {
        return true;
      }

      if (item.sticker.section !== "World Cup History") {
        return false;
      }

      const number = item.sticker.number ?? -1;
      return number >= min && number <= max;
    });

    return [...filtered].sort(
      (left, right) => left.sticker.orderIndex - right.sticker.orderIndex
    );
  }

  const filtered = spread.sections
    ? stickers.filter((item) => spread.sections?.includes(item.sticker.section ?? ""))
    : spread.team
      ? stickers.filter((item) => item.sticker.team === spread.team)
      : [];

  return [...filtered].sort(
    (left, right) => left.sticker.orderIndex - right.sticker.orderIndex
  );
}

export function getSpreadSummary(stickers: UserStickerDto[]): {
  owned: number;
  total: number;
} {
  const owned = stickers.filter((item) => item.status !== "missing").length;

  return {
    owned,
    total: stickers.length
  };
}
