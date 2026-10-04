import { describe, it, expect } from "vitest";
import { buildEmployerChecklist } from "./employer-checklist";

const none = { companyComplete: false, jobs: 0, jobsWithRequirements: 0, publishedEver: 0 };

describe("buildEmployerChecklist", () => {
  it("lists the steps in order, none done for a new employer", () => {
    const items = buildEmployerChecklist(none);
    expect(items.map((i) => i.key)).toEqual(["company", "job", "review", "publish"]);
    expect(items.every((i) => !i.done)).toBe(true);
  });

  it("ticks each step from its own count", () => {
    const items = buildEmployerChecklist({ companyComplete: true, jobs: 2, jobsWithRequirements: 0, publishedEver: 0 });
    expect(Object.fromEntries(items.map((i) => [i.key, i.done]))).toEqual({
      company: true,
      job: true,
      review: false,
      publish: false,
    });
  });

  it("links every step to an employer page", () => {
    for (const item of buildEmployerChecklist(none)) expect(item.href.startsWith("/employer")).toBe(true);
  });
});