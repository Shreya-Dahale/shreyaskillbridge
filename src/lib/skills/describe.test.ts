import { describe, it, expect } from "vitest";
import { evidenceText, explainGap, historyText } from "./describe";
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

describe("historyText", () => {
  it("shows years and last used for a direct match", () => {
    expect(historyText(gap({ candidateYears: 4, lastUsedYear: 2023 }))).toBe("4 yrs · last used 2023");
  });

  it("falls back when nothing more is known", () => {
    expect(historyText(gap({}))).toBe("On your profile");
  });

  it("names the skill an implied match came through", () => {
    expect(historyText(gap({ match: { kind: "IMPLIED", via: "MySQL" }, candidateYears: 2 }))).toBe(
      "Through MySQL (2 yrs)"
    );
  });

  it("labels adjacent experience", () => {
    expect(
      historyText(gap({ match: { kind: "RELATED", via: "Spring" }, candidateYears: 3, lastUsedYear: 2023 }))
    ).toBe("Adjacent: Spring (3 yrs · last used 2023)");
  });

  it("says so when nothing is on record", () => {
    expect(historyText(gap({ match: { kind: "NONE", via: null } }))).toBe("Nothing on record");
  });
});

describe("evidenceText", () => {
  it("describes each status", () => {
    expect(evidenceText("DEMONSTRATED")).toBe("Passed a recent practice task");
    expect(evidenceText("DEVELOPING")).toBe("Practice task started");
    expect(evidenceText("NEEDS_REFRESH")).toBe("No recent evidence");
    expect(evidenceText("NOT_YET_DEMONSTRATED")).toBe("No recent evidence");
  });
});