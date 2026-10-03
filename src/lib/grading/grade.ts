import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { runJava } from "./piston";
import { judgeCase } from "./judge";
import type { GradeResult } from "./result";

type Db = Prisma.TransactionClient;

const STALE_RUNNING_MS = 10 * 60 * 1000;

async function recordEvidence(
  db: Db,
  candidateId: string,
  taskId: string,
  skillIds: string[],
  status: "PASSED" | "FAILED"
) {
  const kind = status === "PASSED" ? ("PASSED" as const) : ("IN_PROGRESS" as const);
  const now = new Date();

  for (const skillId of skillIds) {
    const existing = await db.evidence.findFirst({
      where: { candidateId, skillId, taskId, kind },
    });
    if (existing) {
      await db.evidence.update({ where: { id: existing.id }, data: { occurredAt: now } });
    } else {
      await db.evidence.create({
        data: { candidateId, skillId, taskId, kind, occurredAt: now },
      });
    }
  }
}

/** Grades one submission. Safe to call twice: only the first call can claim it. */
export async function gradeSubmission(submissionId: string, candidateId: string): Promise<void> {
  const claimed = await prisma.submission.updateMany({
    where: {
      id: submissionId,
      candidateId,
      OR: [
        { status: { in: ["QUEUED", "ERROR"] } },
        { status: "RUNNING", createdAt: { lt: new Date(Date.now() - STALE_RUNNING_MS) } },
      ],
    },
    data: { status: "RUNNING" },
  });
  if (claimed.count === 0) return;

  try {
    const submission = await prisma.submission.findUniqueOrThrow({
      where: { id: submissionId },
      select: {
        code: true,
        task: {
          select: {
            id: true,
            timeLimitMs: true,
            testCases: {
              orderBy: { position: "asc" },
              select: { label: true, input: true, expectedOutput: true, hidden: true },
            },
            skills: { select: { skillId: true } },
          },
        },
      },
    });
    const { task } = submission;
    if (task.testCases.length === 0) throw new Error("Task has no test cases");

    const cases: GradeResult["cases"] = [];
    let compileError: string | undefined;
    let stopped = false;

    for (const tc of task.testCases) {
      if (stopped) {
        cases.push({ label: tc.label, hidden: tc.hidden, verdict: "NOT_RUN" });
        continue;
      }

      const run = await runJava(submission.code, tc.input, task.timeLimitMs);
      const verdict = judgeCase(run, tc.expectedOutput);

      if (verdict === "COMPILE_ERROR") compileError = run.stderr.slice(0, 2000);
      if (verdict === "COMPILE_ERROR" || verdict === "LIMIT_EXCEEDED") stopped = true;

      // Hidden cases keep the verdict only, never the output or the error text.
      if (tc.hidden) {
        cases.push({ label: tc.label, hidden: true, verdict });
      } else {
        cases.push({
          label: tc.label,
          hidden: false,
          verdict,
          actual: run.stdout.slice(0, 1000),
          stderr:
            verdict === "RUNTIME_ERROR" || verdict === "LIMIT_EXCEEDED"
              ? run.stderr.slice(0, 1000)
              : undefined,
        });
      }
    }

    const passedCount = cases.filter((c) => c.verdict === "PASSED").length;
    const status = passedCount === cases.length ? ("PASSED" as const) : ("FAILED" as const);
    const result: GradeResult = { compileError, cases };

    await prisma.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id: submissionId },
        data: {
          status,
          passedCount,
          totalCount: cases.length,
          resultJson: JSON.parse(JSON.stringify(result)),
          gradedAt: new Date(),
        },
      });
      await recordEvidence(
        tx,
        candidateId,
        task.id,
        task.skills.map((s) => s.skillId),
        status
      );
    });
  } catch (e) {
    console.error("Grading failed", e);
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "ERROR" },
    });
  }
}