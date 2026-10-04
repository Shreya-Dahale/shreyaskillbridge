import { describe, it, expect } from "vitest";
import { buildChecklist } from "./checklist";

const none = { roles: 0, skills: 0, targets: 0, passedTasks: 0, linksCreated: 0 };

describe("buildChecklist", () => {
  it("lists the steps in a natural order, none done for a new candidate", () => {
    const items = buildChecklist(none);
    expect(items.map((i) => i.key)).toEqual(["history", "resume", "target", "task", "share"]);
    expect(items.every((i) => !i.done)).toBe(true);
  });

  it("ticks each step from its own count", () => {
    const items = buildChecklist({ ...none, roles: 2, passedTasks: 1 });
    expect(Object.fromEntries(items.map((i) => [i.key, i.done]))).toEqual({
      history: true,
      resume: false,
      target: false,
      task: true,
      share: false,
    });
  });

  it("is complete when every count is positive", () => {
    const items = buildChecklist({ roles: 1, skills: 5, targets: 1, passedTasks: 3, linksCreated: 2 });
    expect(items.every((i) => i.done)).toBe(true);
  });

  it("links every step to a candidate page", () => {
    for (const item of buildChecklist(none)) expect(item.href.startsWith("/candidate/")).toBe(true);
  });
});