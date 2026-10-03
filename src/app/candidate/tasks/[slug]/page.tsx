import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { submitCode, regradeSubmission } from "@/app/actions/tasks";
import { gradeResultSchema, VERDICT_LABEL } from "@/lib/grading/result";

const errors: Record<string, string> = {
  empty: "Please write some code before submitting.",
  invalid: "Your code contains characters that can't be saved.",
  size: "Your code is too long. The limit is 20,000 characters.",
  limit: "You have reached the limit of 30 submissions per hour. Please try again later.",
};

const statusLabel = {
  QUEUED: "Waiting to be graded",
  RUNNING: "Being graded",
  PASSED: "Passed",
  FAILED: "Not passed yet",
  ERROR: "Could not be graded",
} as const;

export default async function TaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; submitted?: string; fresh?: string }>;
}) {
  const { slug } = await params;
  const { error, submitted, fresh } = await searchParams;
  const profile = await requireCandidate();

  const task = await prisma.task.findFirst({
    where: { slug, active: true, kind: "JAVA_CODE" },
    select: {
      id: true,
      slug: true,
      title: true,
      instructions: true,
      starterCode: true,
      timeLimitMs: true,
      skills: { select: { skill: { select: { name: true } } } },
      testCases: {
        where: { hidden: false },
        orderBy: { position: "asc" },
        select: { label: true, input: true, expectedOutput: true },
      },
    },
  });
  if (!task) notFound();

  const [hiddenCount, submissions] = await Promise.all([
    prisma.taskTestCase.count({ where: { taskId: task.id, hidden: true } }),
    prisma.submission.findMany({
      where: { candidateId: profile.id, taskId: task.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        code: true,
        status: true,
        passedCount: true,
        totalCount: true,
        createdAt: true,
        resultJson: true,
      },
    }),
  ]);

  const skillNames = task.skills.map((s) => s.skill.name).join(", ");
  const expectedByLabel = new Map(task.testCases.map((tc) => [tc.label, tc.expectedOutput]));
  const initialCode = fresh ? task.starterCode : (submissions[0]?.code ?? task.starterCode);
  const latest = submissions[0];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/candidate/tasks" className="text-sm underline">
        &larr; All tasks
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <p className="text-sm text-gray-500">
          Builds evidence for: {skillNames} · Java · each test case must finish within{" "}
          {task.timeLimitMs / 1000} seconds
        </p>
      </div>

      {submitted && latest?.status === "PASSED" && (
        <p className="rounded border border-green-300 p-3 text-sm text-green-800">
          Passed. This now counts as recent evidence for {skillNames} on your profile.
        </p>
      )}
      {submitted && latest?.status === "FAILED" && (
        <p className="rounded border border-amber-300 p-3 text-sm text-amber-800">
          Graded: {latest.passedCount} of {latest.totalCount} cases passed. Open the details below to see what to
          fix, then try again.
        </p>
      )}
      {submitted && latest?.status === "ERROR" && (
        <p className="rounded border border-amber-300 p-3 text-sm text-amber-800">
          Your submission was saved, but the grader isn&apos;t available right now. You can use Grade again in a
          moment.
        </p>
      )}
      {error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">
          {errors[error] ?? "Something went wrong."}
        </p>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Instructions</h2>
        <pre className="whitespace-pre-wrap rounded border p-3 font-sans text-sm">{task.instructions}</pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Sample cases</h2>
        <ul className="space-y-3">
          {task.testCases.map((tc) => (
            <li key={tc.label} className="space-y-2 rounded border p-3 text-sm">
              <p className="font-medium">{tc.label}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Input</p>
                  <pre className="whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs">{tc.input}</pre>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expected output</p>
                  <pre className="whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs">{tc.expectedOutput}</pre>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-500">
          {hiddenCount} more test case{hiddenCount === 1 ? " is" : "s are"} hidden. They are used when your code is
          graded, and for those you only see whether each one passed.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Your code</h2>
          <Link href={`/candidate/tasks/${task.slug}?fresh=1`} className="text-sm underline">
            Reset to starter code
          </Link>
        </div>
        <form action={submitCode} className="space-y-3">
          <input type="hidden" name="slug" value={task.slug} />
          <textarea
            name="code"
            defaultValue={initialCode}
            required
            rows={22}
            spellCheck={false}
            className="w-full rounded border p-3 font-mono text-sm"
          />
          <p className="text-xs text-gray-500">
            Your class must be called Main. The Tab key moves between fields, so use spaces to indent. Grading can
            take a few seconds.
          </p>
          <button className="rounded bg-black px-5 py-2 text-white">Submit</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your submissions</h2>
        {submissions.length === 0 && <p className="text-sm text-gray-500">No submissions yet.</p>}
        <ul className="space-y-3">
          {submissions.map((s) => {
            const parsed = gradeResultSchema.safeParse(s.resultJson);
            const result = parsed.success ? parsed.data : null;
            const graded = s.status === "PASSED" || s.status === "FAILED";
            return (
              <li key={s.id} className="space-y-2 rounded border p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span>{s.createdAt.toLocaleString("en-GB")}</span>
                  <span className="flex items-center gap-3 text-gray-600">
                    <span>
                      {statusLabel[s.status]}
                      {graded && ` · ${s.passedCount}/${s.totalCount} cases`}
                    </span>
                    {(s.status === "QUEUED" || s.status === "ERROR") && (
                      <form action={regradeSubmission}>
                        <input type="hidden" name="id" value={s.id} />
                        <button className="underline">Grade again</button>
                      </form>
                    )}
                  </span>
                </div>

                {result && (
                  <details>
                    <summary className="cursor-pointer">Details</summary>
                    <div className="mt-2 space-y-3">
                      {result.compileError && (
                        <div>
                          <p className="text-xs text-gray-500">Compiler message</p>
                          <pre className="whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs">
                            {result.compileError}
                          </pre>
                        </div>
                      )}
                      <ul className="space-y-2">
                        {result.cases.map((c, i) => (
                          <li key={`${c.label}-${i}`} className="rounded border p-2">
                            <p>
                              <span className="font-medium">
                                {c.hidden ? "Hidden case" : "Sample case"}: {c.label}
                              </span>{" "}
                              <span className={c.verdict === "PASSED" ? "text-green-700" : "text-gray-700"}>
                                · {VERDICT_LABEL[c.verdict]}
                              </span>
                            </p>
                            {!c.hidden && c.verdict === "WRONG_ANSWER" && (
                              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                <div>
                                  <p className="text-xs text-gray-500">Your output</p>
                                  <pre className="whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs">
                                    {c.actual || "(nothing printed)"}
                                  </pre>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Expected output</p>
                                  <pre className="whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs">
                                    {expectedByLabel.get(c.label) ?? ""}
                                  </pre>
                                </div>
                              </div>
                            )}
                            {!c.hidden && c.stderr && (
                              <pre className="mt-2 whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs">
                                {c.stderr}
                              </pre>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}