import type { AlbumSpreadDefinition } from "./album-pages.js";
import { ALBUM_SPREADS, getSpreadFilterValue, getSpreadStickers } from "./album-pages.js";
import type { AlbumStickerStatus, UserStickerDto } from "./index.js";
import { getTeamDisplayLabel } from "./team-themes.js";

export interface AlbumSpreadProgressDto {
  spreadId: string;
  team: string;
  label: string;
  subtitle: string | null;
  groupLabel: string | null;
  owned: number;
  missing: number;
  total: number;
  completionPercentage: number;
}

export interface LegendaryPlayerDefinition {
  id: string;
  name: string;
  shortName: string;
  stickerCode: string;
  team: string;
  portraitSrc: string;
}

export interface LegendaryPlayerMedalDto extends LegendaryPlayerDefinition {
  earned: boolean;
  repeated: boolean;
  status: AlbumStickerStatus;
}

export const LEGENDARY_PLAYERS: LegendaryPlayerDefinition[] = [
  {
    id: "messi",
    name: "Lionel Messi",
    shortName: "Messi",
    stickerCode: "ARG17",
    team: "Argentina",
    portraitSrc: "/players/messi.jpg"
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    shortName: "Ronaldo",
    stickerCode: "POR15",
    team: "Portugal",
    portraitSrc: "/players/ronaldo.jpg"
  },
  {
    id: "mbappe",
    name: "Kylian Mbappé",
    shortName: "Mbappé",
    stickerCode: "FRA20",
    team: "Francia",
    portraitSrc: "/players/mbappe.jpg"
  },
  {
    id: "yamal",
    name: "Lamine Yamal",
    shortName: "Yamal",
    stickerCode: "ESP15",
    team: "España",
    portraitSrc: "/players/yamal.jpg"
  },
  {
    id: "haaland",
    name: "Erling Haaland",
    shortName: "Haaland",
    stickerCode: "NOR15",
    team: "Noruega",
    portraitSrc: "/players/haaland.jpg"
  },
  {
    id: "vinicius",
    name: "Vinícius Júnior",
    shortName: "Vinícius",
    stickerCode: "BRA14",
    team: "Brasil",
    portraitSrc: "/players/vinicius.jpg"
  },
  {
    id: "bellingham",
    name: "Jude Bellingham",
    shortName: "Bellingham",
    stickerCode: "ENG11",
    team: "Inglaterra",
    portraitSrc: "/players/bellingham.jpg"
  }
];

function getSpreadProgressLabel(spread: AlbumSpreadDefinition): string {
  if (spread.team) {
    return getTeamDisplayLabel(spread.team)?.spanish ?? spread.title;
  }

  return spread.filterLabel ?? spread.title;
}

function getSpreadProgressSubtitle(spread: AlbumSpreadDefinition): string | null {
  if (spread.groupLabel) {
    return spread.groupLabel;
  }

  if (spread.filterLabel && spread.filterLabel !== spread.title) {
    return spread.title;
  }

  return null;
}

export function buildAlbumSpreadProgress(stickers: UserStickerDto[]): AlbumSpreadProgressDto[] {
  return ALBUM_SPREADS.filter((spread) => Boolean(spread.team))
    .map((spread) => {
    const spreadStickers = getSpreadStickers(stickers, spread);

    if (spreadStickers.length === 0) {
      return null;
    }

    const owned = spreadStickers.filter((item) => item.quantityOwned > 0).length;
    const total = spreadStickers.length;
    const missing = total - owned;

    return {
      spreadId: spread.id,
      team: spread.team!,
      label: getSpreadProgressLabel(spread),
      subtitle: getSpreadProgressSubtitle(spread),
      groupLabel: spread.groupLabel ?? null,
      owned,
      missing,
      total,
      completionPercentage: total === 0 ? 0 : Number(((owned / total) * 100).toFixed(1))
    };
  })
    .filter((item): item is AlbumSpreadProgressDto => item !== null)
    .sort(
      (left, right) =>
        left.missing - right.missing ||
        right.completionPercentage - left.completionPercentage ||
        left.label.localeCompare(right.label, "es", { sensitivity: "base" })
    );
}

export function buildLegendaryMedals(stickers: UserStickerDto[]): LegendaryPlayerMedalDto[] {
  const stickerByCode = new Map(stickers.map((item) => [item.sticker.code, item]));

  return LEGENDARY_PLAYERS.map((player) => {
    const item = stickerByCode.get(player.stickerCode);
    const earned = (item?.quantityOwned ?? 0) > 0;

    return {
      ...player,
      earned,
      repeated: (item?.quantityRepeated ?? 0) > 0,
      status: item?.status ?? "missing"
    };
  });
}
