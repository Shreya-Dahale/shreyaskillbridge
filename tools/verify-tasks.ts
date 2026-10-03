import { TASK_LIBRARY, type TaskDefinition, type TaskTestCaseDef } from "../src/lib/tasks/library";
import { REFERENCE_SOLUTIONS } from "../src/lib/tasks/solutions";
import { runJava, runSql, type RunResult } from "../src/lib/grading/piston";
import { judgeCase, judgeSqlCase } from "../src/lib/grading/judge";
import type { Verdict } from "../src/lib/grading/result";

const isSql = (task: TaskDefinition) => task.kind === "SQL";

async function runOne(task: TaskDefinition, code: string, tc: TaskTestCaseDef): Promise<RunResult> {
  return isSql(task)
    ? runSql(tc.input, code, task.timeLimitMs)
    : runJava(code, tc.input, task.timeLimitMs);
}

async function runAll(task: TaskDefinition, code: string) {
  const results: { label: string; verdict: Verdict; run: RunResult }[] = [];
  for (const tc of task.testCases) {
    const run = await runOne(task, code, tc);
    const verdict = isSql(task) ? judgeSqlCase(run, tc.expectedOutput) : judgeCase(run, tc.expectedOutput);
    results.push({ label: tc.label, verdict, run });
  }
  return results;
}

async function main() {
  let problems = 0;

  for (const task of TASK_LIBRARY) {
    console.log(`\n${task.slug} (${task.kind ?? "JAVA_CODE"})`);

    const solution = await runAll(task, REFERENCE_SOLUTIONS[task.slug]);
    const solutionPassed = solution.filter((x) => x.verdict === "PASSED").length;
    console.log(`  reference solution: ${solutionPassed}/${solution.length} passed`);
    for (const x of solution.filter((y) => y.verdict !== "PASSED")) {
      problems++;
      const expected = task.testCases.find((t) => t.label === x.label)?.expectedOutput ?? "";
      console.log(`    FAIL ${x.label}: ${x.verdict}`);
      console.log(`      got:      ${JSON.stringify(x.run.stdout.slice(0, 200))}`);
      console.log(`      expected: ${JSON.stringify(expected)}`);
      if (x.run.stderr) console.log(`      stderr:   ${x.run.stderr.slice(0, 200)}`);
    }

    const starter = await runAll(task, task.starterCode);
    const starterPassed = starter.filter((x) => x.verdict === "PASSED").length;
    const runs = !starter.some((x) => x.verdict === "COMPILE_ERROR" || x.verdict === "SQL_ERROR");
    console.log(`  starter code: ${starterPassed}/${starter.length} passed, runs without errors: ${runs}`);
    if (!runs) problems++;
    if (starterPassed === starter.length) {
      problems++;
      console.log("    PROBLEM: the starter passes every test, so the task is not testing anything");
    }
  }

  console.log(problems === 0 ? "\nAll tasks are fair." : `\n${problems} problem(s) found.`);
  process.exitCode = problems === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error("Could not run the verification (is Piston running?)", e);
  process.exitCode = 1;
});