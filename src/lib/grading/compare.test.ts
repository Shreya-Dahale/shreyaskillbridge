import { describe, it, expect } from "vitest";
import { outputsMatch } from "./compare";

describe("outputsMatch", () => {
  it("ignores trailing newlines and trailing spaces", () => {
    expect(outputsMatch("2.00\n", "2.00")).toBe(true);
    expect(outputsMatch("YES  \nNO\n\n", "YES\nNO")).toBe(true);
  });

  it("ignores Windows line endings", () => {
    expect(outputsMatch("a 1\r\nb 2\r\n", "a 1\nb 2")).toBe(true);
  });

  it("does not ignore real differences", () => {
    expect(outputsMatch("2.0", "2.00")).toBe(false);
    expect(outputsMatch("YES\nNO", "NO\nYES")).toBe(false);
    expect(outputsMatch("a  b", "a b")).toBe(false);
  });

  it("does not ignore leading whitespace or missing output", () => {
    expect(outputsMatch(" 2.00", "2.00")).toBe(false);
    expect(outputsMatch("", "2.00")).toBe(false);
  });
});