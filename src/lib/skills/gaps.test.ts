import { describe, it, expect } from "vitest";
import { detectGaps } from "./gaps";

const d = (s: string) => new Date(`${s}T00:00:00Z`);
const iso = (x: Date | null) => (x ? x.toISOString().slice(0, 10) : null);
const today = d("2026-10-01");

describe("detectGaps", () => {
  it("flags the stretch after the last role as an ongoing gap", () => {
    const gaps = detectGaps(
      [
        { start: d("2019-09-01"), end: d("2021-08-31") },
        { start: d("2021-09-01"), end: d("2023-09-30") },
      ],
      today
    );
    expect(gaps).toHaveLength(1);
    expect(iso(gaps[0].start)).toBe("2023-10-01");
    expect(gaps[0].end).toBeNull();
  });

  it("flags a gap between two roles", () => {
    const gaps = detectGaps(
      [
        { start: d("2018-01-01"), end: d("2018-12-31") },
        { start: d("2020-01-01"), end: d("2020-12-31") },
      ],
      d("2020-12-31")
    );
    expect(gaps).toHaveLength(1);
    expect(iso(gaps[0].start)).toBe("2019-01-01");
    expect(iso(gaps[0].end)).toBe("2019-12-31");
  });

  it("ignores short gaps", () => {
    const gaps = detectGaps(
      [
        { start: d("2020-01-01"), end: d("2020-12-31") },
        { start: d("2021-03-01"), end: d("2022-12-31") },
      ],
      d("2022-12-31")
    );
    expect(gaps).toHaveLength(0);
  });

  it("does not create a gap from overlapping roles", () => {
    const gaps = detectGaps(
      [
        { start: d("2020-01-01"), end: d("2022-12-31") },
        { start: d("2021-06-01"), end: d("2021-12-31") },
      ],
      d("2022-12-31")
    );
    expect(gaps).toHaveLength(0);
  });

  it("does not invent a gap between year-only dates", () => {
    const gaps = detectGaps(
      [
        { start: d("2019-01-01"), end: d("2021-12-31") },
        { start: d("2022-01-01"), end: d("2023-12-31") },
      ],
      d("2023-12-31")
    );
    expect(gaps).toHaveLength(0);
  });

  it("returns nothing when there are no roles", () => {
    expect(detectGaps([], today)).toEqual([]);
  });
});