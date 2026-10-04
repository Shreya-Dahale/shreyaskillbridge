import { describe, it, expect } from "vitest";
import { topCounts } from "./counts";

describe("topCounts", () => {
  it("counts and sorts by frequency", () => {
    expect(topCounts(["Java", "SQL", "Java", "Docker", "Java", "SQL"], 10)).toEqual([
      { name: "Java", count: 3 },
      { name: "SQL", count: 2 },
      { name: "Docker", count: 1 },
    ]);
  });

  it("breaks ties alphabetically, ignoring case", () => {
    expect(topCounts(["b", "A", "c"], 10).map((x) => x.name)).toEqual(["A", "b", "c"]);
  });

  it("applies the limit", () => {
    expect(topCounts(["a", "b", "c", "a"], 2)).toEqual([
      { name: "a", count: 2 },
      { name: "b", count: 1 },
    ]);
  });

  it("handles no input", () => {
    expect(topCounts([], 5)).toEqual([]);
  });
});