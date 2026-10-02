import { describe, it, expect } from "vitest";
import { explainGap } from "./describe";
import type { SkillGap } from "./gap-engine";

function gap(overrides: Partial<SkillGap>): SkillGap {
  return {
    skillId: "x",
    name: "Java",
    importance: "REQUIRED",
    minYears: null,
    status: "NEEDS_REFRESH",
    match: { kind: "DIRECT", via: null },
    candidateYears: null,
    lastUsedYear: null,
    notes: [],
    ...overrides,
  };
}

describe("explainGap", () => {
  it("explains a direct match with years and a stale note", () => {
    const { lines, hint } = explainGap(
      gap({ candidateYears: 4, lastUsedYear: 2023, notes: ["STALE"] })
    );
    expect(lines).toEqual(["Your profile lists Java (4 yrs).", "Last used in 2023."]);
    expect(hint).toContain("recent practical task");
  });

  it("labels adjacent experience clearly", () => {
    const { lines } = explainGap(
      gap({
        name: "Spring Boot",
        match: { kind: "RELATED", via: "Spring" },
        candidateYears: 3,
        notes: ["ADJACENT_ONLY"],
      })
    );
    expect(lines[0]).toContain("adjacent experience through Spring");
    expect(lines[0]).toContain("not the same thing");
  });

  it("says nothing is on record when there is no match", () => {
    const { lines, hint } = explainGap(
      gap({ name: "Docker", status: "NOT_YET_DEMONSTRATED", match: { kind: "NONE", via: null } })
    );
    expect(lines).toEqual(["Nothing on your profile covers Docker yet."]);
    expect(hint).toContain("build evidence");
  });

  it("mentions the shortfall against a minimum", () => {
    const { lines } = explainGap(gap({ minYears: 3, candidateYears: 2, notes: ["BELOW_MIN_YEARS"] }));
    expect(lines).toContain("This job asks for 3+ years; your profile shows 2.");
  });

  it("describes demonstrated skills without a hint", () => {
    const { lines, hint } = explainGap(gap({ status: "DEMONSTRATED", candidateYears: 4 }));
    expect(lines[0]).toBe("You recently showed this skill through an assessment.");
    expect(hint).toBeNull();
  });

  it("does not say 'nothing on your profile' when a skill is Developing from scratch", () => {
    const { lines } = explainGap(
      gap({ status: "DEVELOPING", match: { kind: "NONE", via: null } })
    );
    expect(lines).toEqual(["You have started working on this skill."]);
  });
});