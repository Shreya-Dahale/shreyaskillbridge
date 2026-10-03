import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { submitCode } from "@/app/actions/tasks";

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
  FAILED: "Not passed",
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
      select: { id: true, code: true, status: true, passedCount: true, totalCount: true, createdAt: true },
    }),
  ]);

  const initialCode = fresh ? task.starterCode : (submissions[0]?.code ?? task.starterCode);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/candidate/tasks" className="text-sm underline">
        &larr; All tasks
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <p className="text-sm text-gray-500">
          Builds evidence for: {task.skills.map((s) => s.skill.name).join(", ")} · Java · each test case must
          finish within {task.timeLimitMs / 1000} seconds
        </p>
      </div>

      {submitted && (
        <p className="rounded border border-green-300 p-3 text-sm text-green-800">
          Submission received.
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
          {hiddenCount} more test case{hiddenCount === 1 ? " is" : "s are"} hidden. They are used when your
          code is graded.
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
            Your class must be called Main. The Tab key moves between fields, so use spaces to indent.
          </p>
          <button className="rounded bg-black px-5 py-2 text-white">Submit</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your submissions</h2>
        {submissions.length === 0 && <p className="text-sm text-gray-500">No submissions yet.</p>}
        <ul className="space-y-2">
          {submissions.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded border p-3 text-sm">
              <span>{s.createdAt.toLocaleString("en-GB")}</span>
              <span className="text-gray-600">
                {statusLabel[s.status]}
                {s.status !== "QUEUED" && s.status !== "RUNNING" && ` · ${s.passedCount}/${s.totalCount} cases`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}