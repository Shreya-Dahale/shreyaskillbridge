import { describe, it, expect } from "vitest";
import { judgeCase } from "./judge";
import type { RunResult } from "./piston";

const base: RunResult = {
  stdout: "2.00\n",
  stderr: "",
  exitCode: 0,
  signal: null,
  compileError: false,
  killed: false,
};

const run = (overrides: Partial<RunResult>): RunResult => ({ ...base, ...overrides });

describe("judgeCase", () => {
  it("passes when the output matches", () => {
    expect(judgeCase(run({}), "2.00")).toBe("PASSED");
  });

  it("is forgiving about trailing whitespace only", () => {
    expect(judgeCase(run({ stdout: "2.00   \n\n" }), "2.00")).toBe("PASSED");
    expect(judgeCase(run({ stdout: "2.0" }), "2.00")).toBe("WRONG_ANSWER");
  });

  it("reports wrong answers", () => {
    expect(judgeCase(run({ stdout: "3.00\n" }), "2.00")).toBe("WRONG_ANSWER");
    expect(judgeCase(run({ stdout: "" }), "2.00")).toBe("WRONG_ANSWER");
  });

  it("reports runtime errors, even when the output was right", () => {
    expect(judgeCase(run({ exitCode: 1, stderr: "Exception in thread main" }), "2.00")).toBe("RUNTIME_ERROR");
  });

  it("reports sandbox kills as limit exceeded", () => {
    expect(judgeCase(run({ exitCode: null, signal: "SIGKILL", killed: true }), "2.00")).toBe("LIMIT_EXCEEDED");
  });

  it("puts compile errors first", () => {
    expect(judgeCase(run({ compileError: true, exitCode: 1, killed: true }), "2.00")).toBe("COMPILE_ERROR");
  });
});