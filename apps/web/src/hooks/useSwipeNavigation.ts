import { useRef, type TouchEvent as ReactTouchEvent } from "react";

const SWIPE_MIN_DISTANCE = 56;

type UseSwipeNavigationOptions = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
};

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      "button, input, select, textarea, a, label, summary, [role='button'], [contenteditable='true']"
    )
  );
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  enabled = true
}: UseSwipeNavigationOptions) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);

  onSwipeLeftRef.current = onSwipeLeft;
  onSwipeRightRef.current = onSwipeRight;

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

    if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE || Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) {
      return;
    }

    if (deltaX > 0) {
      onSwipeLeftRef.current?.();
      return;
    }

    onSwipeRightRef.current?.();
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: resetTouchStart,
    className: enabled ? "album-spread-swipeable" : undefined
  };
}
