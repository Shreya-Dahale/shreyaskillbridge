import { describe, it, expect } from "vitest";
import { isActive } from "./is-active";

describe("isActive", () => {
  it("matches the page itself and pages beneath it", () => {
    expect(isActive("/candidate/tasks", "/candidate/tasks")).toBe(true);
    expect(isActive("/candidate/tasks/java-average", "/candidate/tasks")).toBe(true);
    expect(isActive("/candidate/share/activity", "/candidate/share")).toBe(true);
  });

  it("does not match a different page that starts with the same letters", () => {
    expect(isActive("/candidate/sharing", "/candidate/share")).toBe(false);
    expect(isActive("/candidate/skills", "/candidate/s")).toBe(false);
  });

  it("matches the dashboard only exactly", () => {
    expect(isActive("/candidate", "/candidate", true)).toBe(true);
    expect(isActive("/candidate/profile", "/candidate", true)).toBe(false);
  });

  it("does not match unrelated pages", () => {
    expect(isActive("/employer/jobs", "/candidate/jobs")).toBe(false);
  });
});