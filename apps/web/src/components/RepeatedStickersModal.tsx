import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { UserStickerDto } from "@mundial-album/shared";
import {
  getRepeatedStickerAlbumSectionLabel,
  getRepeatedStickerAlbumSectionOrder,
  getWorldCupGroupTeamOrder,
  sortRepeatedStickersByAlbum
} from "@mundial-album/shared";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { IconButton } from "./ui/GradientButton";

type RepeatedViewMode = "alphabetical" | "album-groups";

type RepeatedStickerTeamGroup = {
  key: string;
  title: string;
  items: UserStickerDto[];
  totalRepeated: number;
};

type RepeatedStickerSectionGroup = {
  key: string;
  title: string;
  totalRepeated: number;
  teams: RepeatedStickerTeamGroup[];
  items: UserStickerDto[];
};

function sumRepeatedQuantity(items: UserStickerDto[]): number {
  return items.reduce((total, item) => total + item.quantityRepeated, 0);
}

function buildAlphabeticalGroups(stickers: UserStickerDto[]): RepeatedStickerSectionGroup[] {
  const groups = new Map<string, UserStickerDto[]>();

  for (const item of stickers) {
    if (item.quantityRepeated <= 0) {
      continue;
    }

    const title = item.sticker.team ?? item.sticker.section ?? "Otros";
    const current = groups.get(title) ?? [];
    current.push(item);
    groups.set(title, current);
  }

  return Array.from(groups.entries())
    .map(([title, items]) => {
      const sortedItems = sortRepeatedStickersByAlbum(items);

      return {
        key: title,
        title,
        totalRepeated: sumRepeatedQuantity(sortedItems),
        teams: [],
        items: sortedItems
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title, "es", { sensitivity: "base" }));
}

function buildAlbumGroupSections(stickers: UserStickerDto[]): RepeatedStickerSectionGroup[] {
  const sectionOrder = getRepeatedStickerAlbumSectionOrder();
  const buckets = new Map<string, UserStickerDto[]>();

  for (const item of stickers) {
    if (item.quantityRepeated <= 0) {
      continue;
    }

    const sectionLabel = getRepeatedStickerAlbumSectionLabel(item.sticker);
    const current = buckets.get(sectionLabel) ?? [];
    current.push(item);
    buckets.set(sectionLabel, current);
  }

  const orderedLabels = [
    ...sectionOrder.filter((label) => buckets.has(label)),
    ...Array.from(buckets.keys()).filter((label) => !sectionOrder.includes(label))
  ];
  const sections: RepeatedStickerSectionGroup[] = [];

  for (const sectionLabel of orderedLabels) {
    const sectionItems = buckets.get(sectionLabel);
    if (!sectionItems?.length) {
      continue;
    }

    const worldCupTeams = getWorldCupGroupTeamOrder(sectionLabel);

    if (worldCupTeams.length > 0) {
      const teams = worldCupTeams.flatMap((teamName) => {
        const teamItems = sortRepeatedStickersByAlbum(
          sectionItems.filter((item) => item.sticker.team === teamName)
        );

        if (teamItems.length === 0) {
          return [];
        }

        return [
          {
            key: `${sectionLabel}-${teamName}`,
            title: teamName,
            items: teamItems,
            totalRepeated: sumRepeatedQuantity(teamItems)
          }
        ];
      });

      sections.push({
        key: sectionLabel,
        title: sectionLabel,
        totalRepeated: sumRepeatedQuantity(sectionItems),
        teams,
        items: []
      });
      continue;
    }

    const sortedItems = sortRepeatedStickersByAlbum(sectionItems);

    sections.push({
      key: sectionLabel,
      title: sectionLabel,
      totalRepeated: sumRepeatedQuantity(sortedItems),
      teams: [],
      items: sortedItems
    });
  }

  return sections;
}

function RepeatedStickerList({ items }: { items: UserStickerDto[] }) {
  return (
    <ul className="grid gap-1.5">
      {items.map((item) => (
        <li
          key={item.stickerId}
          className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        >
          <span className="text-sm font-black tracking-wide text-white">{item.sticker.code}</span>
          {item.quantityRepeated > 1 ? (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-extrabold text-amber-100">
              x{item.quantityRepeated}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

type RepeatedStickersModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  stickers: UserStickerDto[];
  onClose: () => void;
};

export function RepeatedStickersModal({
  isOpen,
  isLoading = false,
  stickers,
  onClose
}: RepeatedStickersModalProps) {
  const [viewMode, setViewMode] = useState<RepeatedViewMode>("alphabetical");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setViewMode("alphabetical");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const groups = useMemo(() => {
    const repeated = stickers.filter((item) => item.quantityRepeated > 0);

    return viewMode === "alphabetical"
      ? buildAlphabeticalGroups(repeated)
      : buildAlbumGroupSections(repeated);
  }, [stickers, viewMode]);

  if (!isOpen) {
    return null;
  }

  const totalRepeated = stickers.reduce((total, item) => total + item.quantityRepeated, 0);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-panini-navy/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(85dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[1.5rem] border border-white/15 bg-panini-navy/95 text-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="repeated-stickers-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4">
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-panini-gold">
              Repetidas
            </p>
            <h2 id="repeated-stickers-modal-title" className="mt-1 text-xl font-black">
              {totalRepeated} figuritas
            </h2>
          </div>
          <IconButton type="button" aria-label="Cerrar" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </IconButton>
        </header>

        <div className="border-b border-white/10 px-4 py-3">
          <div
            className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1"
            role="tablist"
            aria-label="Orden de repetidas"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "alphabetical"}
              className={cn(
                "rounded-xl px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-wide transition-colors",
                viewMode === "alphabetical"
                  ? "bg-white/15 text-white"
                  : "text-white/55"
              )}
              onClick={() => setViewMode("alphabetical")}
            >
              Por país (A-Z)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "album-groups"}
              className={cn(
                "rounded-xl px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-wide transition-colors",
                viewMode === "album-groups"
                  ? "bg-white/15 text-white"
                  : "text-white/55"
              )}
              onClick={() => setViewMode("album-groups")}
            >
              Por grupos
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 [-webkit-overflow-scrolling:touch]">
          {isLoading ? <p className="empty-state">Cargando repetidas...</p> : null}

          {!isLoading && totalRepeated === 0 ? (
            <p className="empty-state">Todavía no tenés repetidas cargadas.</p>
          ) : null}

          {!isLoading && groups.length > 0 ? (
            <div className="grid gap-3">
              {groups.map((group) => (
                <section
                  key={group.key}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
                    <h3 className="text-sm font-black text-white">{group.title}</h3>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-extrabold text-amber-100">
                      {group.totalRepeated}
                    </span>
                  </div>

                  <div className="p-3">
                    {group.teams.length > 0 ? (
                      <div className="grid gap-3">
                        {group.teams.map((teamGroup) => (
                          <div key={teamGroup.key} className="grid gap-2">
                            <div className="flex items-center justify-between gap-2 text-xs font-extrabold uppercase tracking-wide text-white/60">
                              <h4>{teamGroup.title}</h4>
                              <span>{teamGroup.totalRepeated}</span>
                            </div>
                            <RepeatedStickerList items={teamGroup.items} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <RepeatedStickerList items={group.items} />
                    )}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
