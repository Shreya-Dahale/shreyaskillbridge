export const CURRENT_WORDS = ["present", "current", "now", "ongoing", "till date", "to date"];

function utc(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day));
}

/**
 * Parses a date string from a resume.
 *  "YYYY-MM"  start -> first day of that month, end -> last day of that month
 *  "YYYY"     start -> 1 Jan, end -> 31 Dec (the most generous reading, so we never invent a gap)
 *  "present"  (end only) -> today
 * Returns null if the value can't be understood.
 */
export function parseResumeDate(
  value: string | null | undefined,
  edge: "start" | "end",
  today: Date = new Date()
): Date | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (!v) return null;

  const thisYear = today.getUTCFullYear();
  const yearOk = (y: number) => y >= 1950 && y <= thisYear + 1;

  if (edge === "end" && CURRENT_WORDS.includes(v)) {
    return utc(thisYear, today.getUTCMonth(), today.getUTCDate());
  }

  const ym = /^(\d{4})-(\d{1,2})$/.exec(v);
  if (ym) {
    const year = Number(ym[1]);
    const month = Number(ym[2]);
    if (!yearOk(year) || month < 1 || month > 12) return null;
    return edge === "start" ? utc(year, month - 1, 1) : utc(year, month, 0);
  }

  const y = /^(\d{4})$/.exec(v);
  if (y) {
    const year = Number(y[1]);
    if (!yearOk(year)) return null;
    return edge === "start" ? utc(year, 0, 1) : utc(year, 11, 31);
  }

  return null;
}