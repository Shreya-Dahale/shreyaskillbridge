import { describe, it, expect } from "vitest";
import { TASK_LIBRARY } from "./library";
import { REFERENCE_SOLUTIONS } from "./solutions";
import { canonicalSkill } from "../skills/canonical";

describe("task library", () => {
  it("has unique slugs", () => {
    const slugs = TASK_LIBRARY.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  for (const task of TASK_LIBRARY) {
    describe(task.slug, () => {
      it("has samples and hidden cases", () => {
        expect(task.testCases.filter((c) => !c.hidden).length).toBeGreaterThanOrEqual(2);
        expect(task.testCases.filter((c) => c.hidden).length).toBeGreaterThanOrEqual(3);
      });

      it("has well-formed test cases", () => {
        for (const tc of task.testCases) {
          expect(tc.expectedOutput.trim(), `${tc.label} has no expected output`).not.toBe("");
          expect(tc.input.endsWith("\n"), `${tc.label} input should end with a newline`).toBe(true);
        }
      });

      it("uses a time limit Piston accepts", () => {
        expect(task.timeLimitMs).toBeGreaterThan(0);
        expect(task.timeLimitMs).toBeLessThanOrEqual(3000);
      });

      it("only references canonical skill names", () => {
        expect(task.skills.length).toBeGreaterThan(0);
        for (const name of task.skills) expect(canonicalSkill(name).name).toBe(name);
      });

      it("has a reference solution that differs from the starter code", () => {
        const solution = REFERENCE_SOLUTIONS[task.slug];
        expect(solution, "missing reference solution").toBeTruthy();
        expect(solution).not.toBe(task.starterCode);
        if ((task.kind ?? "JAVA_CODE") === "SQL") {
          expect(solution.toUpperCase()).toContain("SELECT");
          for (const tc of task.testCases) {
            expect(tc.input.toUpperCase(), `${tc.label} has no table setup`).toContain("CREATE TABLE");
          }
        } else {
          expect(solution).toContain("public class Main");
          expect(task.starterCode).toContain("public class Main");
        }
      });
    });
  }

  it("has no reference solution without a task", () => {
    const slugs = new Set(TASK_LIBRARY.map((t) => t.slug));
    for (const slug of Object.keys(REFERENCE_SOLUTIONS)) expect(slugs.has(slug)).toBe(true);
  });
});