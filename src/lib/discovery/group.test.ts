import { describe, it, expect } from "vitest";
import { GROUP_LABEL, groupCandidates, stableOrderKey } from "./group";
import type { CandidateMatch, MatchGroup } from "./match";

type Item = { code: string; match: CandidateMatch };

const mk = (code: string, group: MatchGroup): Item => ({
  code,
  match: { rows: [], group, requiredTotal: 5, requiredDemonstrated: 0 },
});

describe("stableOrderKey", () => {
  it("is deterministic and an unsigned 32-bit integer", () => {
    expect(stableOrderKey("K3M9QT", "job-1")).toBe(stableOrderKey("K3M9QT", "job-1"));
    const key = stableOrderKey("K3M9QT", "job-1");
    expect(Number.isInteger(key)).toBe(true);
    expect(key).toBeGreaterThanOrEqual(0);
    expect(key).toBeLessThanOrEqual(0xffffffff);
  });

  it("changes with the job and with the code", () => {
    expect(stableOrderKey("K3M9QT", "job-1")).not.toBe(stableOrderKey("K3M9QT", "job-2"));
    expect(stableOrderKey("K3M9QT", "job-1")).not.toBe(stableOrderKey("7HPW2D", "job-1"));
  });
});

describe("groupCandidates", () => {
  const items: Item[] = [
    mk("K3M9QT", "SOME_RECENT"),
    mk("7HPW2D", "EXPERIENCE_ONLY"),
    mk("R4XNB8", "SOME_RECENT"),
    mk("E9TC5Y", "EXPERIENCE_ONLY"),
    mk("W2ZJ6F", "NONE"),
    mk("N8VG3A", "ALL_RECENT"),
  ];

  it("puts groups in a fixed order with their labels", () => {
    const groups = groupCandidates(items, "job-1");
    expect(groups.map((g) => g.group)).toEqual(["ALL_RECENT", "SOME_RECENT", "EXPERIENCE_ONLY"]);
    expect(groups.map((g) => g.label)).toEqual([
      GROUP_LABEL.ALL_RECENT,
      GROUP_LABEL.SOME_RECENT,
      GROUP_LABEL.EXPERIENCE_ONLY,
    ]);
  });

  it("drops candidates with nothing relevant", () => {
    const codes = groupCandidates(items, "job-1").flatMap((g) => g.items.map((i) => i.code));
    expect(codes).not.toContain("W2ZJ6F");
    expect(codes).toHaveLength(5);
  });

  it("leaves out empty groups", () => {
    const groups = groupCandidates([mk("K3M9QT", "SOME_RECENT")], "job-1");
    expect(groups.map((g) => g.group)).toEqual(["SOME_RECENT"]);
  });

  it("orders each group by the stable key, whatever order the input came in", () => {
    const forward = groupCandidates(items, "job-1");
    const reversed = groupCandidates([...items].reverse(), "job-1");
    expect(reversed).toEqual(forward);

    for (const g of forward) {
      const keys = g.items.map((i) => stableOrderKey(i.code, "job-1"));
      expect([...keys].sort((a, b) => a - b)).toEqual(keys);
    }
  });

  it("returns nothing when no one is relevant", () => {
    expect(groupCandidates([mk("W2ZJ6F", "NONE")], "job-1")).toEqual([]);
    expect(groupCandidates([], "job-1")).toEqual([]);
  });
});