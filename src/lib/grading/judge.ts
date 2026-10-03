import type { RunResult } from "./piston";
import type { Verdict } from "./result";
import { outputsMatch } from "./compare";

/** Decides the verdict for one test case. Order matters: a compile error beats everything else. */
export function judgeCase(run: RunResult, expectedOutput: string): Verdict {
  if (run.compileError) return "COMPILE_ERROR";
  if (run.killed) return "LIMIT_EXCEEDED";
  if (run.exitCode !== 0) return "RUNTIME_ERROR";
  return outputsMatch(run.stdout, expectedOutput) ? "PASSED" : "WRONG_ANSWER";
}