import type { CSSProperties } from "react";
import {
  ALBUM_SPREADS,
  getAlbumSpreadFilterGroups,
  getSpreadFilterValue,
  getSpreadStickers,
  getSpreadSummary,
  getSpreadVisualTheme,
  getTeamDisplayLabel,
  type UpdateUserStickerPayload,
  type UserStickerDto
} from "@mundial-album/shared";
import { useMemo, useState } from "react";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";
import { SpreadHero } from "./SpreadHero";
import { StickerGrid } from "./StickerGrid";
import { TeamFilter } from "./TeamFilter";

type AlbumSpreadViewerProps = {
  stickers: UserStickerDto[];
  editable?: boolean;
  onUpdate?: ((stickerId: string, payload: UpdateUserStickerPayload) => Promise<void>) | undefined;
};

export function AlbumSpreadViewer({
  stickers,
  editable = false,
  onUpdate
}: AlbumSpreadViewerProps) {
  const [pageIndex, setPageIndex] = useState(0);

  const spreadFilterGroups = useMemo(() => getAlbumSpreadFilterGroups(), []);

  const spreadPages = useMemo(
    () =>
      ALBUM_SPREADS.map((spread) => ({
        spread,
        stickers: getSpreadStickers(stickers, spread)
      })).filter((page) => page.stickers.length > 0),
    [stickers]
  );

  const safePageIndex = Math.min(pageIndex, Math.max(spreadPages.length - 1, 0));
  const currentPage = spreadPages[safePageIndex];
  const summary = currentPage ? getSpreadSummary(currentPage.stickers) : { owned: 0, total: 0 };
  const isCompactSpread = Boolean(currentPage?.spread.compact);
  const spreadTheme = currentPage
    ? getSpreadVisualTheme(currentPage.spread)
    : getSpreadVisualTheme({ id: "historia-1", title: "Historia del Mundial" });
  const spreadStyle = {
    "--spread-primary": spreadTheme.primary,
    "--spread-secondary": spreadTheme.secondary,
    "--spread-accent": spreadTheme.accent
  } as CSSProperties;

  function goToPreviousPage(): void {
    setPageIndex((current) => Math.max(current - 1, 0));
  }

  function goToNextPage(): void {
    setPageIndex((current) => Math.min(current + 1, spreadPages.length - 1));
  }

  function goToSpread(filterValue: string): void {
    if (!filterValue) {
      return;
    }

    const nextIndex = spreadPages.findIndex(
      (page) => getSpreadFilterValue(page.spread) === filterValue
    );

    if (nextIndex >= 0) {
      setPageIndex(nextIndex);
    }
  }

  const swipeHandlers = useSwipeNavigation({
    enabled: spreadPages.length > 1,
    onSwipeLeft: goToNextPage,
    onSwipeRight: goToPreviousPage
  });

  if (spreadPages.length === 0) {
    return <p className="empty-state">No hay figuritas para mostrar.</p>;
  }

  if (!currentPage) {
    return null;
  }

  const teamDisplayLabel = currentPage.spread.team
    ? getTeamDisplayLabel(currentPage.spread.team)
    : null;

  return (
    <section className="album-spread album-spread-swipeable" {...swipeHandlers}>
      <TeamFilter
        groups={spreadFilterGroups}
        selectedTeam={getSpreadFilterValue(currentPage.spread)}
        label="Seccion"
        placeholder="Seleccionar..."
        onSelectTeam={goToSpread}
      />

      <div className="album-spread-panel work-panel spread-themed" style={spreadStyle}>
        <SpreadHero
          theme={spreadTheme}
          title={teamDisplayLabel?.spanish ?? currentPage.spread.title}
          groupLabel={currentPage.spread.groupLabel}
          owned={summary.owned}
          total={summary.total}
          canGoPrevious={safePageIndex > 0}
          canGoNext={safePageIndex < spreadPages.length - 1}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
          {...(teamDisplayLabel && teamDisplayLabel.english !== teamDisplayLabel.spanish
            ? { subtitle: teamDisplayLabel.english }
            : {})}
        />

        <StickerGrid
          items={currentPage.stickers}
          editable={editable}
          compact={isCompactSpread}
          onUpdate={onUpdate}
        />
      </div>
    </section>
  );
}
