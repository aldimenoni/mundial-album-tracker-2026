import { useRef, type TouchEvent as ReactTouchEvent } from "react";

const SWIPE_MIN_DISTANCE = 50;

type UseSwipeNavigationOptions = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
};

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest("button, input, select, textarea, a, label"));
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  enabled = true
}: UseSwipeNavigationOptions) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function resetTouchStart(): void {
    touchStart.current = null;
  }

  function handleTouchStart(event: ReactTouchEvent): void {
    if (!enabled || isInteractiveTarget(event.target)) {
      resetTouchStart();
      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: ReactTouchEvent): void {
    if (!enabled || !touchStart.current) {
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      resetTouchStart();
      return;
    }

    const deltaX = touchStart.current.x - touch.clientX;
    const deltaY = touchStart.current.y - touch.clientY;
    resetTouchStart();

    if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX > 0) {
      onSwipeLeft?.();
      return;
    }

    onSwipeRight?.();
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: resetTouchStart
  };
}
