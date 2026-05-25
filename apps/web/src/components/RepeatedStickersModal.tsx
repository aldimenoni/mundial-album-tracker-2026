import { useEffect, useMemo, useState } from "react";
import type { UserStickerDto } from "@mundial-album/shared";
import {
  getRepeatedStickerAlbumSectionLabel,
  getRepeatedStickerAlbumSectionOrder,
  getWorldCupGroupTeamOrder,
  sortRepeatedStickersByAlbum
} from "@mundial-album/shared";
import { X } from "lucide-react";

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
    <ul className="repeated-stickers-list">
      {items.map((item) => (
        <li key={item.stickerId} className="repeated-stickers-item">
          <span className="repeated-stickers-code">{item.sticker.code}</span>
          {item.quantityRepeated > 1 ? (
            <span className="repeated-stickers-quantity">x{item.quantityRepeated}</span>
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

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel repeated-stickers-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="repeated-stickers-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Repetidas</p>
            <h2 id="repeated-stickers-modal-title">Detalle</h2>
          </div>
          <button
            className="icon-button icon-button-ghost modal-close"
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="repeated-stickers-toolbar">
          <div
            className="repeated-stickers-view-toggle"
            role="tablist"
            aria-label="Orden de repetidas"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "alphabetical"}
              className={`repeated-stickers-view-option${viewMode === "alphabetical" ? " repeated-stickers-view-option-active" : ""}`}
              onClick={() => setViewMode("alphabetical")}
            >
              Por país (A-Z)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "album-groups"}
              className={`repeated-stickers-view-option${viewMode === "album-groups" ? " repeated-stickers-view-option-active" : ""}`}
              onClick={() => setViewMode("album-groups")}
            >
              Por grupos del álbum
            </button>
          </div>
        </div>

        <div className="modal-body">
          {isLoading ? <p className="empty-state">Cargando repetidas...</p> : null}

          {!isLoading && totalRepeated === 0 ? (
            <p className="empty-state">Todavía no tenés repetidas cargadas.</p>
          ) : null}

          {!isLoading && groups.length > 0 ? (
            <div className="repeated-stickers-groups">
              {groups.map((group) => (
                <section key={group.key} className="repeated-stickers-group">
                  <div className="repeated-stickers-group-header">
                    <h3>{group.title}</h3>
                    <span>{group.totalRepeated}</span>
                  </div>

                  {group.teams.length > 0 ? (
                    <div className="repeated-stickers-subgroups">
                      {group.teams.map((teamGroup) => (
                        <div key={teamGroup.key} className="repeated-stickers-subgroup">
                          <div className="repeated-stickers-subgroup-header">
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
                </section>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
