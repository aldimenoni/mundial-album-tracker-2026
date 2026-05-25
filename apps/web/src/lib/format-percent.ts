export function formatCompletionPercent(value: number): number {
  return Math.round(Math.min(Math.max(value, 0), 100));
}

export function formatCompletionPercentLabel(value: number): string {
  return `${formatCompletionPercent(value)}%`;
}
