import { describe, it, expect } from "vitest";
import { DEFAULT_DISCOVERY, canBeMatched, hasAnySection, parseDiscoveryForm } from "./settings";

const form = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });

describe("DEFAULT_DISCOVERY", () => {
  it("starts switched off, with the approved section defaults", () => {
    expect(DEFAULT_DISCOVERY.enabled).toBe(false);
    expect(DEFAULT_DISCOVERY.includeRoles).toBe(false);
    expect(DEFAULT_DISCOVERY.includeBreak).toBe(false);
    expect(DEFAULT_DISCOVERY.includeSkills).toBe(true);
  });
});

describe("parseDiscoveryForm", () => {
  it("reads ticked boxes and treats missing ones as off", () => {
    const f = parseDiscoveryForm(form({ enabled: "on", includeSkills: "on", includeBreak: "on" }));
    expect(f).toEqual({
      enabled: true,
      includeHeadline: false,
      includeSkills: true,
      includeAssessments: false,
      includeSummary: false,
      includeRoles: false,
      includeBreak: true,
    });
  });

  it("accepts only the exact value 'on'", () => {
    const f = parseDiscoveryForm(form({ enabled: "true", includeSkills: "yes", includeRoles: "ON" }));
    expect(f.enabled).toBe(false);
    expect(f.includeSkills).toBe(false);
    expect(f.includeRoles).toBe(false);
  });

  it("turns everything off for an empty form", () => {
    expect(Object.values(parseDiscoveryForm(form({}))).every((v) => v === false)).toBe(true);
  });
});

describe("hasAnySection", () => {
  it("is false only when every section is off", () => {
    const off = { ...DEFAULT_DISCOVERY, includeHeadline: false, includeSkills: false, includeAssessments: false, includeSummary: false };
    expect(hasAnySection(off)).toBe(false);
    expect(hasAnySection({ ...off, includeBreak: true })).toBe(true);
  });
});

describe("canBeMatched", () => {
  it("needs skills or passed tasks to be shared", () => {
    expect(canBeMatched(DEFAULT_DISCOVERY)).toBe(true);
    expect(canBeMatched({ ...DEFAULT_DISCOVERY, includeSkills: false })).toBe(true);
    expect(canBeMatched({ ...DEFAULT_DISCOVERY, includeSkills: false, includeAssessments: false })).toBe(false);
  });
});