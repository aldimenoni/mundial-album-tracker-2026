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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";
import {
  albumSpreadSlideTransition,
  albumSpreadSlideVariants
} from "../lib/motion-presets";
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
  const prefersReducedMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpreadFilter = searchParams.get("cuadro");
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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
  const canSwipeBetweenSpreads = spreadPages.length > 1;

  function goToPreviousPage(): void {
    setDirection(-1);
    setPageIndex((current) => Math.max(current - 1, 0));
  }

  function goToNextPage(): void {
    setDirection(1);
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
      setDirection(nextIndex === safePageIndex ? 0 : nextIndex > safePageIndex ? 1 : -1);
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
      setDirection(0);
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
    enabled: canSwipeBetweenSpreads,
    onSwipeLeft: goToNextPage,
    onSwipeRight: goToPreviousPage
  });

  const { className: swipeClassName, ...spreadTouchHandlers } = swipeHandlers;

  if (spreadPages.length === 0) {
    return <p className="empty-state">No hay figuritas para mostrar.</p>;
  }

  if (!currentPage) {
    return null;
  }

  const summary = getSpreadSummary(currentPage.stickers);
  const isCompactSpread = Boolean(currentPage.spread.compact);
  const spreadTheme = getSpreadVisualTheme(currentPage.spread);
  const spreadStyle = {
    "--spread-primary": spreadTheme.primary,
    "--spread-secondary": spreadTheme.secondary,
    "--spread-accent": spreadTheme.accent
  } as CSSProperties;
  const teamDisplayLabel = currentPage.spread.team
    ? getTeamDisplayLabel(currentPage.spread.team)
    : null;
  const pageRange = getSpreadAlbumPageRange(currentPage.spread);
  const pageLabel = pageRange ? formatAlbumPageRange(pageRange) : undefined;
  const isHistoriaSpread = currentPage.spread.id.startsWith("historia-");
  const slideTransition = prefersReducedMotion ? { duration: 0 } : albumSpreadSlideTransition;
  const slideVariants = prefersReducedMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 }
      }
    : albumSpreadSlideVariants;

  return (
    <section className="grid gap-3">
      <TeamFilter
        groups={spreadFilterGroups}
        selectedTeam={getSpreadFilterValue(currentPage.spread)}
        label="Seccion"
        placeholder="Seleccionar..."
        onSelectTeam={goToSpread}
      />

      {canSwipeBetweenSpreads ? (
        <p className="flex items-center justify-center gap-1.5 text-center text-[0.72rem] font-bold text-white/45">
          <ChevronLeft size={14} aria-hidden="true" />
          Deslizá para avanzar o volver en el álbum
          <ChevronRight size={14} aria-hidden="true" />
        </p>
      ) : null}

      <div
        className={`overflow-hidden rounded-[1.5rem] border border-white/15 bg-panini-navy/50 shadow-lg ${swipeClassName ?? ""}`}
        style={spreadStyle}
        {...spreadTouchHandlers}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentPage.spread.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
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
              showTypeIcon={!isHistoriaSpread}
              onUpdate={onUpdate}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
