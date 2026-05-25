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
  { label: "Grupo B", teams: ["Canada", "Bosnia y Herzegovina", "Qatar", "Suiza"] },
  { label: "Grupo C", teams: ["Brasil", "Marruecos", "Haiti", "Escocia"] },
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

export function getWorldCupGroupLabelForTeam(team: string | null | undefined): string | null {
  if (!team) {
    return null;
  }

  return WORLD_CUP_GROUPS.find((group) => group.teams.includes(team))?.label ?? null;
}

export function getWorldCupGroupTeamOrder(groupLabel: string): string[] {
  return WORLD_CUP_GROUPS.find((group) => group.label === groupLabel)?.teams ?? [];
}

export function getRepeatedStickerAlbumSectionLabel(
  sticker: Pick<UserStickerDto["sticker"], "team" | "section" | "number">
): string {
  const worldCupGroup = getWorldCupGroupLabelForTeam(sticker.team);
  if (worldCupGroup) {
    return worldCupGroup;
  }

  if (sticker.section === "Coca-Cola" || sticker.team === "Coca-Cola") {
    return COCA_COLA_FILTER_LABEL;
  }

  if (sticker.section === "World Cup History") {
    const number = sticker.number ?? -1;

    if (number >= 1 && number <= 8) {
      return HISTORY_1_FILTER_LABEL;
    }

    if (number >= 9 && number <= 19) {
      return HISTORY_2_FILTER_LABEL;
    }
  }

  if (sticker.section === "Panini") {
    return HISTORY_1_FILTER_LABEL;
  }

  return sticker.team ?? sticker.section ?? "Otros";
}

export function getRepeatedStickerAlbumSectionOrder(): string[] {
  return [
    HISTORY_1_FILTER_LABEL,
    ...WORLD_CUP_GROUPS.map((group) => group.label),
    HISTORY_2_FILTER_LABEL,
    COCA_COLA_FILTER_LABEL,
    "Otros"
  ];
}

export function sortRepeatedStickersByAlbum(stickers: UserStickerDto[]): UserStickerDto[] {
  return [...stickers].sort(
    (left, right) =>
      left.sticker.orderIndex - right.sticker.orderIndex ||
      left.sticker.code.localeCompare(right.sticker.code, "es")
  );
}
