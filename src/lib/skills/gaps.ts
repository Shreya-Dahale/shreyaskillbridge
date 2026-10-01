export type DateRange = { start: Date; end: Date };
export type Gap = { start: Date; end: Date | null }; // end null = still ongoing

const DAY_MS = 24 * 60 * 60 * 1000;
export const MIN_GAP_DAYS = 180;

/** Sorts ranges and merges overlapping ones, so two jobs at once don't create a false gap. */
export function mergeRanges(ranges: DateRange[]): DateRange[] {
  const sorted = ranges
    .filter((r) => r.end.getTime() >= r.start.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const merged: DateRange[] = [];
  for (const r of sorted) {
    const last = merged[merged.length - 1];
    if (last && r.start.getTime() <= last.end.getTime()) {
      if (r.end.getTime() > last.end.getTime()) last.end = r.end;
    } else {
      merged.push({ start: r.start, end: r.end });
    }
  }
  return merged;
}

/** Finds periods with no role, between roles and from the last role until today. */
export function detectGaps(
  ranges: DateRange[],
  today: Date = new Date(),
  minGapDays: number = MIN_GAP_DAYS
): Gap[] {
  const merged = mergeRanges(ranges);
  const gaps: Gap[] = [];

  for (let i = 1; i < merged.length; i++) {
    const prevEnd = merged[i - 1].end.getTime();
    const nextStart = merged[i].start.getTime();
    const uncoveredDays = (nextStart - prevEnd) / DAY_MS - 1;
    if (uncoveredDays >= minGapDays) {
      gaps.push({
        start: new Date(prevEnd + DAY_MS),
        end: new Date(nextStart - DAY_MS),
      });
    }
  }

  if (merged.length > 0) {
    const lastEnd = merged[merged.length - 1].end.getTime();
    const uncoveredDays = (today.getTime() - lastEnd) / DAY_MS;
    if (uncoveredDays >= minGapDays) {
      gaps.push({ start: new Date(lastEnd + DAY_MS), end: null });
    }
  }

  return gaps;
}