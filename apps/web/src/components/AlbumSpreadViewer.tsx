import type { CSSProperties } from "react";
import {
  ALBUM_SPREADS,
  formatAlbumPageRange,
  getAlbumSpreadFilterGroups,
  getSpreadAlbumPageRange,
  getSpreadFilterValue,
  getSpreadStickers,
  getSpreadSummary,
  getSpreadVisualTheme,
  getTeamDisplayLabel,
  type UpdateUserStickerPayload,
  type UserStickerDto
} from "@mundial-album/shared";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpreadFilter = searchParams.get("cuadro");
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

  useEffect(() => {
    if (!initialSpreadFilter || spreadPages.length === 0) {
      return;
    }

    const nextIndex = spreadPages.findIndex(
      (page) => getSpreadFilterValue(page.spread) === initialSpreadFilter
    );

    if (nextIndex >= 0) {
      setPageIndex(nextIndex);
    }

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        if (!next.has("cuadro")) {
          return current;
        }

        next.delete("cuadro");
        return next;
      },
      { replace: true }
    );
  }, [initialSpreadFilter, spreadPages, setSearchParams]);

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
  const pageRange = getSpreadAlbumPageRange(currentPage.spread);
  const pageLabel = pageRange ? formatAlbumPageRange(pageRange) : undefined;

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
          {...(pageLabel ? { pageLabel } : {})}
          {...(teamDisplayLabel && teamDisplayLabel.english !== teamDisplayLabel.spanish
            ? { subtitle: teamDisplayLabel.english }
            : {})}
        />

        <StickerGrid
          items={currentPage.stickers}
          editable={editable}
          compact={isCompactSpread}
          showTypeIcon={!currentPage.spread.id.startsWith("historia-")}
          onUpdate={onUpdate}
        />
      </div>
    </section>
  );
}
