import { describe, it, expect } from "vitest";
import { displayCode, generateDiscoveryCode, isValidDiscoveryCode } from "./code";

describe("discovery codes", () => {
  it("are six characters from the readable alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateDiscoveryCode();
      expect(code).toHaveLength(6);
      expect(isValidDiscoveryCode(code)).toBe(true);
      expect(code).not.toMatch(/[ILO01]/);
    }
  });

  it("are random", () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateDiscoveryCode()));
    expect(codes.size).toBeGreaterThan(190);
  });

  it("rejects anything else", () => {
    for (const bad of ["", "ABC", "ABCDEFG", "abcdef", "ABCDE0", "ABCD1E", "ABCDE!"]) {
      expect(isValidDiscoveryCode(bad)).toBe(false);
    }
  });

  it("is shown as a candidate label", () => {
    expect(displayCode("K3M9QT")).toBe("Candidate #K3M9QT");
  });
});