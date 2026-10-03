import type { RunResult } from "./piston";
import type { Verdict } from "./result";
import { outputsMatch } from "./compare";

/** Decides the verdict for one Java test case. A compile error beats everything else. */
export function judgeCase(run: RunResult, expectedOutput: string): Verdict {
  if (run.compileError) return "COMPILE_ERROR";
  if (run.killed) return "LIMIT_EXCEEDED";
  if (run.exitCode !== 0) return "RUNTIME_ERROR";
  return outputsMatch(run.stdout, expectedOutput) ? "PASSED" : "WRONG_ANSWER";
}

/** Decides the verdict for one SQL test case. The harness exits 3 for query errors and 4 for too many rows. */
export function judgeSqlCase(run: RunResult, expectedOutput: string): Verdict {
  if (run.killed) return "LIMIT_EXCEEDED";
  if (run.exitCode === 3 && /interrupted/i.test(run.stderr)) return "LIMIT_EXCEEDED";
  if (run.exitCode !== 0) return "SQL_ERROR";
  return outputsMatch(run.stdout, expectedOutput) ? "PASSED" : "WRONG_ANSWER";
}