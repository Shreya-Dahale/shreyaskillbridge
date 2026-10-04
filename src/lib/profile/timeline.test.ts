import { describe, it, expect } from "vitest";
import { buildTimeline } from "./timeline";

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const now = d("2026-10-10");

const roles = [
  { jobTitle: "Junior Java Developer", company: "Nimbus Software", startDate: d("2019-09-01"), endDate: d("2021-08-31") },
  { jobTitle: "Java Developer", company: "Kestrel Systems", startDate: d("2021-09-01"), endDate: d("2023-09-30") },
];
const careerBreaks = [{ startDate: d("2023-10-01"), endDate: null }];

describe("buildTimeline", () => {
  it("returns nothing when there is nothing to show", () => {
    expect(buildTimeline([], [], now)).toBeNull();
  });

  it("orders items by start date and labels them", () => {
    const t = buildTimeline(roles, careerBreaks, now);
    expect(t?.bars.map((b) => b.label)).toEqual([
      "Junior Java Developer · Nimbus Software",
      "Java Developer · Kestrel Systems",
      "Career break",
    ]);
    expect(t?.bars.map((b) => b.kind)).toEqual(["role", "role", "break"]);
  });

  it("writes readable dates, using 'ongoing' for a break and 'present' for a role", () => {
    const t = buildTimeline(
      [...roles, { jobTitle: "Lead", company: "Zed", startDate: d("2024-01-01"), endDate: null }],
      careerBreaks,
      now
    );
    const dates = Object.fromEntries(t?.bars.map((b) => [b.label, b.dates]) ?? []);
    expect(dates["Junior Java Developer · Nimbus Software"]).toBe("Sep 2019 – Aug 2021");
    expect(dates["Career break"]).toBe("Oct 2023 – ongoing");
    expect(dates["Lead · Zed"]).toBe("Jan 2024 – present");
  });

  it("starts at the left edge and ends an ongoing item at the right edge", () => {
    const t = buildTimeline(roles, careerBreaks, now);
    const first = t!.bars[0];
    const last = t!.bars[2];
    expect(first.leftPct).toBe(0);
    expect(last.leftPct + last.widthPct).toBeCloseTo(100, 5);
  });

  it("keeps every bar inside the track and in chronological position", () => {
    const t = buildTimeline(roles, careerBreaks, now)!;
    for (const b of t.bars) {
      expect(b.leftPct).toBeGreaterThanOrEqual(0);
      expect(b.leftPct + b.widthPct).toBeLessThanOrEqual(100.000001);
    }
    expect(t.bars[0].leftPct).toBeLessThan(t.bars[1].leftPct);
    expect(t.bars[1].leftPct).toBeLessThan(t.bars[2].leftPct);
  });

  it("gives very short items a visible minimum width", () => {
    const t = buildTimeline(
      [
        { jobTitle: "Gig", company: "A", startDate: d("2020-01-01"), endDate: d("2020-01-01") },
        { jobTitle: "Long", company: "B", startDate: d("2020-01-01"), endDate: d("2022-01-01") },
      ],
      [],
      now
    )!;
    expect(t.bars.find((b) => b.label === "Gig · A")?.widthPct).toBe(1.5);
  });

  it("skips items whose end is before their start", () => {
    const t = buildTimeline(
      [{ jobTitle: "Bad", company: "X", startDate: d("2022-01-01"), endDate: d("2021-01-01") }, ...roles],
      [],
      now
    )!;
    expect(t.bars.some((b) => b.label === "Bad · X")).toBe(false);
  });

  it("can show only a career break", () => {
    const t = buildTimeline([], careerBreaks, now)!;
    expect(t.bars).toHaveLength(1);
    expect(t.bars[0].kind).toBe("break");
  });

  it("adds one year tick per year within the range", () => {
    const t = buildTimeline(roles, careerBreaks, now)!;
    expect(t.ticks.map((x) => x.label)).toEqual(["2020", "2021", "2022", "2023", "2024", "2025", "2026"]);
    const positions = t.ticks.map((x) => x.leftPct);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(positions.every((p) => p >= 0 && p <= 100)).toBe(true);
  });

  it("thins out the year ticks on a long career", () => {
    const t = buildTimeline(
      [{ jobTitle: "Veteran", company: "Old Co", startDate: d("1990-01-01"), endDate: d("2020-01-01") }],
      [],
      now
    )!;
    expect(t.ticks.length).toBeGreaterThan(0);
    expect(t.ticks.length).toBeLessThanOrEqual(8);
  });
});