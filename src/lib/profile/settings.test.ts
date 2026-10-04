import { describe, it, expect } from "vitest";
import { DEFAULT_SETTINGS, settingsFromSearchParams } from "./settings";

describe("settingsFromSearchParams", () => {
  it("uses the approved defaults when no preview is requested", () => {
    expect(settingsFromSearchParams({})).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS.includeRoles).toBe(false);
    expect(DEFAULT_SETTINGS.includeBreak).toBe(false);
    expect(DEFAULT_SETTINGS.showName).toBe(false);
  });

  it("reads ticked boxes and treats missing ones as off", () => {
    const s = settingsFromSearchParams({ preview: "1", includeSkills: "on", showName: "on" });
    expect(s).toEqual({
      showName: true,
      includeHeadline: false,
      includeSkills: true,
      includeAssessments: false,
      includeSummary: false,
      includeRoles: false,
      includeBreak: false,
    });
  });

  it("accepts only the exact value 'on'", () => {
    const s = settingsFromSearchParams({
      preview: "1",
      includeSkills: "true",
      includeRoles: ["on", "on"],
      includeBreak: "yes",
    });
    expect(s.includeSkills).toBe(false);
    expect(s.includeRoles).toBe(false);
    expect(s.includeBreak).toBe(false);
  });

  it("can switch everything off", () => {
    const s = settingsFromSearchParams({ preview: "1" });
    expect(Object.values(s).every((v) => v === false)).toBe(true);
  });
});