import { describe, it, expect } from "vitest";
import { bucketViewsByDay, summarizeViews, viewerLabel } from "./views";

const at = (s: string) => new Date(s);
const now = at("2026-10-10T15:00:00Z");

describe("bucketViewsByDay", () => {
  it("returns one bucket per day, oldest first, with zeros filled in", () => {
    expect(bucketViewsByDay([], 3, now)).toEqual([
      { date: "2026-10-08", count: 0 },
      { date: "2026-10-09", count: 0 },
      { date: "2026-10-10", count: 0 },
    ]);
  });

  it("counts views on the right UTC day", () => {
    const buckets = bucketViewsByDay(
      [at("2026-10-10T00:00:00Z"), at("2026-10-10T14:59:00Z"), at("2026-10-09T23:59:59Z"), at("2026-10-08T01:00:00Z")],
      3,
      now
    );
    expect(buckets.map((b) => b.count)).toEqual([1, 1, 2]);
  });

  it("ignores views before the window or in the future", () => {
    const buckets = bucketViewsByDay([at("2026-10-07T23:59:59Z"), at("2026-10-11T00:00:00Z")], 3, now);
    expect(buckets.every((b) => b.count === 0)).toBe(true);
  });

  it("handles a 30 day window across a month boundary", () => {
    const buckets = bucketViewsByDay([], 30, now);
    expect(buckets).toHaveLength(30);
    expect(buckets[0].date).toBe("2026-09-11");
    expect(buckets[29].date).toBe("2026-10-10");
  });
});

describe("summarizeViews", () => {
  it("counts totals, distinct companies and anonymous visitors", () => {
    const s = summarizeViews([
      { viewerCompany: "Beta Corp" },
      { viewerCompany: "acme technologies" },
      { viewerCompany: "Beta Corp" },
      { viewerCompany: null },
    ]);
    expect(s.total).toBe(4);
    expect(s.anonymous).toBe(1);
    expect(s.companies).toEqual(["acme technologies", "Beta Corp"]);
  });

  it("handles no views", () => {
    expect(summarizeViews([])).toEqual({ total: 0, anonymous: 0, companies: [] });
  });
});

describe("viewerLabel", () => {
  it("names the company, or the visitor without an account", () => {
    expect(viewerLabel("Beta Corp")).toBe("Beta Corp");
    expect(viewerLabel(null)).toBe("A visitor without an account");
  });
});