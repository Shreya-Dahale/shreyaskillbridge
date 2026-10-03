import { describe, it, expect } from "vitest";
import { judgeCase, judgeSqlCase } from "./judge";
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

describe("judgeSqlCase", () => {
  const sqlRun = (overrides: Partial<RunResult>): RunResult =>
    run({ stdout: "Eng|180\n", ...overrides });

  it("passes when the rows match", () => {
    expect(judgeSqlCase(sqlRun({}), "Eng|180")).toBe("PASSED");
  });

  it("reports wrong rows", () => {
    expect(judgeSqlCase(sqlRun({ stdout: "Ops|60\n" }), "Eng|180")).toBe("WRONG_ANSWER");
    expect(judgeSqlCase(sqlRun({ stdout: "" }), "Eng|180")).toBe("WRONG_ANSWER");
  });

  it("reports query errors", () => {
    expect(
      judgeSqlCase(sqlRun({ exitCode: 3, stdout: "", stderr: "SQL error: no such table: staff" }), "Eng|180")
    ).toBe("SQL_ERROR");
    expect(judgeSqlCase(sqlRun({ exitCode: 4, stdout: "", stderr: "Too many rows" }), "Eng|180")).toBe("SQL_ERROR");
  });

  it("treats a query stopped for doing too much work as a limit", () => {
    expect(
      judgeSqlCase(sqlRun({ exitCode: 3, stdout: "", stderr: "SQL error: interrupted" }), "Eng|180")
    ).toBe("LIMIT_EXCEEDED");
  });

  it("treats a sandbox kill as a limit", () => {
    expect(judgeSqlCase(sqlRun({ exitCode: null, signal: "SIGKILL", killed: true }), "Eng|180")).toBe(
      "LIMIT_EXCEEDED"
    );
  });
});