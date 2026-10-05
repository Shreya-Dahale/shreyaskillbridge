import { describe, it, expect } from "vitest";
import { matchHeadline, noteLabels } from "./describe";
import type { CandidateMatch } from "./match";

const match = (requiredDemonstrated: number, requiredTotal: number): CandidateMatch => ({
  rows: [],
  group: "SOME_RECENT",
  requiredTotal,
  requiredDemonstrated,
});

describe("noteLabels", () => {
  it("describes stale and below-minimum notes", () => {
    expect(noteLabels(["STALE", "BELOW_MIN_YEARS"])).toEqual([
      "last used 3+ years ago",
      "below the minimum years asked (self-reported)",
    ]);
  });

  it("leaves out adjacent-only, because the main text already says it", () => {
    expect(noteLabels(["ADJACENT_ONLY"])).toEqual([]);
    expect(noteLabels([])).toEqual([]);
  });
});

describe("matchHeadline", () => {
  it("counts required skills with recent evidence", () => {
    expect(matchHeadline(match(3, 5))).toBe("3 of 5 required skills with recent evidence");
    expect(matchHeadline(match(0, 5))).toBe("0 of 5 required skills with recent evidence");
  });

  it("uses the singular for one skill", () => {
    expect(matchHeadline(match(1, 1))).toBe("1 of 1 required skill with recent evidence");
  });
});