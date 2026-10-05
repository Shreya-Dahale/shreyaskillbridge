import { describe, it, expect } from "vitest";
import { badgeText } from "./badge";

describe("badgeText", () => {
  it("shows nothing for zero or negative counts", () => {
    expect(badgeText(0)).toBeNull();
    expect(badgeText(-3)).toBeNull();
    expect(badgeText(Number.NaN)).toBeNull();
  });

  it("shows the number up to nine", () => {
    expect(badgeText(1)).toBe("1");
    expect(badgeText(9)).toBe("9");
  });

  it("caps larger numbers", () => {
    expect(badgeText(10)).toBe("9+");
    expect(badgeText(250)).toBe("9+");
  });
});