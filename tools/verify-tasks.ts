import { TASK_LIBRARY, type TaskDefinition } from "../src/lib/tasks/library";
import { REFERENCE_SOLUTIONS } from "../src/lib/tasks/solutions";
import { runJava } from "../src/lib/grading/piston";
import { outputsMatch } from "../src/lib/grading/compare";

async function runAll(task: TaskDefinition, code: string) {
  const results = [];
  for (const tc of task.testCases) {
    const r = await runJava(code, tc.input, task.timeLimitMs);
    const ok = !r.compileError && !r.killed && r.exitCode === 0 && outputsMatch(r.stdout, tc.expectedOutput);
    results.push({ label: tc.label, ok, r });
  }
  return results;
}

async function main() {
  let problems = 0;

  for (const task of TASK_LIBRARY) {
    console.log(`\n${task.slug}`);

    const solution = await runAll(task, REFERENCE_SOLUTIONS[task.slug]);
    const solutionPassed = solution.filter((x) => x.ok).length;
    console.log(`  reference solution: ${solutionPassed}/${solution.length} passed`);
    for (const x of solution.filter((y) => !y.ok)) {
      problems++;
      console.log(`    FAIL ${x.label}: ${x.r.stderr.slice(0, 200) || x.r.stdout.slice(0, 200)}`);
    }

    const starter = await runAll(task, task.starterCode);
    const starterPassed = starter.filter((x) => x.ok).length;
    const compiled = !starter.some((x) => x.r.compileError);
    console.log(`  starter code: ${starterPassed}/${starter.length} passed, compiles: ${compiled}`);
    if (!compiled) problems++;
    if (starterPassed === starter.length) {
      problems++;
      console.log("    PROBLEM: the buggy starter passes every test, so the task is not testing anything");
    }
  }

  console.log(problems === 0 ? "\nAll tasks are fair." : `\n${problems} problem(s) found.`);
  process.exitCode = problems === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error("Could not run the verification (is Piston running?)", e);
  process.exitCode = 1;
});