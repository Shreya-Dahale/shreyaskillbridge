import { describe, it, expect } from "vitest";
import { parseResumeDate } from "./dates";

const today = new Date("2026-10-01T00:00:00Z");
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

describe("parseResumeDate", () => {
  it("reads a month as first day for start, last day for end", () => {
    expect(iso(parseResumeDate("2021-08", "start", today))).toBe("2021-08-01");
    expect(iso(parseResumeDate("2021-08", "end", today))).toBe("2021-08-31");
  });

  it("reads a year-only date generously", () => {
    expect(iso(parseResumeDate("2019", "start", today))).toBe("2019-01-01");
    expect(iso(parseResumeDate("2019", "end", today))).toBe("2019-12-31");
  });

  it("treats 'present' as today, for end dates only", () => {
    expect(iso(parseResumeDate("present", "end", today))).toBe("2026-10-01");
    expect(parseResumeDate("present", "start", today)).toBeNull();
  });

  it("returns null for things it can't read", () => {
    expect(parseResumeDate("abc", "start", today)).toBeNull();
    expect(parseResumeDate("2021-13", "start", today)).toBeNull();
    expect(parseResumeDate("", "end", today)).toBeNull();
    expect(parseResumeDate(undefined, "end", today)).toBeNull();
    expect(parseResumeDate("1800", "start", today)).toBeNull();
  });
});