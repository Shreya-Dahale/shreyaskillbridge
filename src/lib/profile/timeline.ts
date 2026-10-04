import { formatMonthYear } from "./format";

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_SPAN_DAYS = 30;
const MIN_WIDTH_PCT = 1.5;
const MAX_TICKS = 8;

export type TimelineBar = {
  kind: "role" | "break";
  label: string;
  dates: string;
  leftPct: number;
  widthPct: number;
};

export type TimelineTick = { label: string; leftPct: number };

export type Timeline = { bars: TimelineBar[]; ticks: TimelineTick[] };

type RoleInput = { jobTitle: string; company: string; startDate: Date; endDate: Date | null };
type BreakInput = { startDate: Date; endDate: Date | null };

/**
 * Lays roles and career breaks out on one time axis. A break is drawn exactly like a role:
 * as a bar with dates, with no judgement attached.
 */
export function buildTimeline(
  roles: RoleInput[],
  careerBreaks: BreakInput[],
  now: Date = new Date()
): Timeline | null {
  const items = [
    ...roles.map((r) => ({
      kind: "role" as const,
      label: `${r.jobTitle} · ${r.company}`,
      start: r.startDate,
      end: r.endDate,
    })),
    ...careerBreaks.map((b) => ({
      kind: "break" as const,
      label: "Career break",
      start: b.startDate,
      end: b.endDate,
    })),
  ]
    .map((i) => ({ ...i, resolvedEnd: i.end ?? now }))
    .filter((i) => i.resolvedEnd.getTime() >= i.start.getTime())
    .sort(
      (a, b) =>
        a.start.getTime() - b.start.getTime() ||
        (a.kind === b.kind ? 0 : a.kind === "role" ? -1 : 1)
    );

  if (items.length === 0) return null;

  const min = Math.min(...items.map((i) => i.start.getTime()));
  const latestEnd = Math.max(...items.map((i) => i.resolvedEnd.getTime()));
  const span = Math.max(latestEnd - min, MIN_SPAN_DAYS * DAY_MS);
  const max = min + span;
  const pct = (t: number) => ((t - min) / span) * 100;

  const bars: TimelineBar[] = items.map((i) => {
    const leftPct = Math.min(pct(i.start.getTime()), 100 - MIN_WIDTH_PCT);
    const rawWidth = pct(i.resolvedEnd.getTime()) - pct(i.start.getTime());
    const widthPct = Math.min(Math.max(rawWidth, MIN_WIDTH_PCT), 100 - leftPct);
    const endText = i.end ? formatMonthYear(i.end) : i.kind === "break" ? "ongoing" : "present";
    return {
      kind: i.kind,
      label: i.label,
      dates: `${formatMonthYear(i.start)} – ${endText}`,
      leftPct,
      widthPct,
    };
  });

  const years: number[] = [];
  for (let y = new Date(min).getUTCFullYear() + 1; y <= new Date(max).getUTCFullYear(); y++) {
    const t = Date.UTC(y, 0, 1);
    if (t > min && t < max) years.push(y);
  }
  const step = Math.max(1, Math.ceil(years.length / MAX_TICKS));
  const ticks: TimelineTick[] = years
    .filter((_, index) => index % step === 0)
    .map((y) => ({ label: String(y), leftPct: pct(Date.UTC(y, 0, 1)) }))
    .filter((t) => t.leftPct >= 3 && t.leftPct <= 97);

  return { bars, ticks };
}