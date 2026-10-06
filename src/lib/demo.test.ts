import { describe, it, expect } from "vitest";
import { isDemoMode } from "./demo";

describe("isDemoMode", () => {
  it("is on only for the exact value 'true'", () => {
    expect(isDemoMode("true")).toBe(true);
    for (const v of [undefined, "", "false", "TRUE", "1", "yes"]) expect(isDemoMode(v)).toBe(false);
  });
});