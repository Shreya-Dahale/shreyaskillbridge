/** The text for a sidebar badge. Nothing is shown for zero, and large numbers are capped. */
export function badgeText(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  return count > 9 ? "9+" : String(count);
}