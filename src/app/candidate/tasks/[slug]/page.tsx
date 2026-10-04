import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MinusCircle, RotateCcw, Send, XCircle } from "lucide-react";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { SubmitButton } from "@/components/SubmitButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { regradeSubmission, submitCode } from "@/app/actions/tasks";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";
import { gradeResultSchema, VERDICT_LABEL, type Verdict } from "@/lib/grading/result";
import { cn } from "@/lib/utils";

const errors: Record<string, string> = {
  empty: "Please write some code before submitting.",
  invalid: "Your code contains characters that can't be saved.",
  size: "Your code is too long. The limit is 20,000 characters.",
  limit: "You have reached the limit of 30 submissions per hour. Please try again later.",
};

const STATUS = {
  QUEUED: { label: "Waiting to be graded", className: "bg-muted text-muted-foreground" },
  RUNNING: { label: "Being graded", className: "bg-blue-100 text-blue-800" },
  PASSED: { label: "Passed", className: "bg-green-100 text-green-800" },
  FAILED: { label: "Not passed yet", className: "bg-amber-100 text-amber-800" },
  ERROR: { label: "Could not be graded", className: "bg-red-100 text-red-800" },
} as const;

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  if (verdict === "PASSED") return <CheckCircle2 className="size-4 shrink-0 text-green-600" aria-hidden="true" />;
  if (verdict === "NOT_RUN") return <MinusCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />;
  if (verdict === "LIMIT_EXCEEDED") return <Clock className="size-4 shrink-0 text-amber-600" aria-hidden="true" />;
  return <XCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />;
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs">{children}</pre>
    </div>
  );
}

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
    where: { slug, active: true, kind: { in: ["JAVA_CODE", "SQL"] } },
    select: {
      id: true,
      slug: true,
      title: true,
      kind: true,
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

  const isSql = task.kind === "SQL";
  const skillNames = task.skills.map((s) => s.skill.name).join(", ");
  const expectedByLabel = new Map(task.testCases.map((tc) => [tc.label, tc.expectedOutput]));
  const initialCode = fresh ? task.starterCode : (submissions[0]?.code ?? task.starterCode);
  const latest = submissions[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={task.title}
        description={`Builds evidence for ${skillNames}. Each test case must finish within ${task.timeLimitMs / 1000} seconds.`}
        back={{ href: "/candidate/tasks", label: "All tasks" }}
      >
        <Badge variant="outline">{isSql ? "SQL" : "Java"}</Badge>
      </PageHeader>

      {submitted && latest?.status === "PASSED" && (
        <Notice tone="success">Passed. This now counts as recent evidence for {skillNames} on your profile.</Notice>
      )}
      {submitted && latest?.status === "FAILED" && (
        <Notice tone="warning">
          Graded: {latest.passedCount} of {latest.totalCount} cases passed. Open the details below to see what to
          fix, then try again.
        </Notice>
      )}
      {submitted && latest?.status === "ERROR" && (
        <Notice tone="warning">
          Your submission was saved, but the grader isn&apos;t available right now. You can use Grade again in a
          moment.
        </Notice>
      )}
      {error && <Notice tone="error">{errors[error] ?? "Something went wrong."}</Notice>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                {task.instructions}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sample cases</CardTitle>
              <CardDescription>
                {hiddenCount} more test case{hiddenCount === 1 ? " is" : "s are"} hidden. They are used when your
                code is graded, and for those you only see whether each one passed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.testCases.map((tc) => (
                <div key={tc.label} className="space-y-2 rounded-lg border p-3">
                  <p className="text-sm font-medium">{tc.label}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Block label={isSql ? "Sample data (SQL)" : "Input"}>{tc.input}</Block>
                    <Block label={isSql ? "Expected rows" : "Expected output"}>{tc.expectedOutput}</Block>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Your {isSql ? "query" : "code"}</CardTitle>
                <Link
                  href={`/candidate/tasks/${task.slug}?fresh=1`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <RotateCcw /> Reset to starter
                </Link>
              </div>
              <CardDescription>
                {isSql
                  ? "Write exactly one SELECT statement. Use spaces to indent, because the Tab key moves between fields."
                  : "Your class must be called Main. Use spaces to indent, because the Tab key moves between fields."}{" "}
                Grading can take a few seconds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={submitCode} className="space-y-3">
                <input type="hidden" name="slug" value={task.slug} />
                <Textarea
                  name="code"
                  aria-label={isSql ? "Your SQL query" : "Your Java code"}
                  defaultValue={initialCode}
                  required
                  rows={20}
                  spellCheck={false}
                  className="min-h-80 font-mono text-sm"
                />
                <SubmitButton pendingText="Grading...">
                  <Send /> Submit
                </SubmitButton>
              </form>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Your submissions</h2>
            {submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
            <ul className="space-y-3">
              {submissions.map((s) => {
                const parsed = gradeResultSchema.safeParse(s.resultJson);
                const result = parsed.success ? parsed.data : null;
                const graded = s.status === "PASSED" || s.status === "FAILED";
                const status = STATUS[s.status];
                return (
                  <li key={s.id}>
                    <Card>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm">{s.createdAt.toLocaleString("en-GB")}</span>
                          <div className="flex items-center gap-2">
                            {graded && (
                              <span className="text-xs text-muted-foreground">
                                {s.passedCount}/{s.totalCount} cases
                              </span>
                            )}
                            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", status.className)}>
                              {status.label}
                            </span>
                            {(s.status === "QUEUED" || s.status === "ERROR") && (
                              <form action={regradeSubmission}>
                                <input type="hidden" name="id" value={s.id} />
                                <SubmitButton variant="outline" size="sm" pendingText="Grading...">
                                  Grade again
                                </SubmitButton>
                              </form>
                            )}
                          </div>
                        </div>

                        {result && (
                          <details className="text-sm">
                            <summary className="cursor-pointer font-medium">Details</summary>
                            <div className="mt-3 space-y-3">
                              {result.compileError && <Block label="Compiler message">{result.compileError}</Block>}
                              <ul className="space-y-2">
                                {result.cases.map((c, i) => (
                                  <li key={`${c.label}-${i}`} className="space-y-2 rounded-lg border p-3">
                                    <p className="flex flex-wrap items-center gap-2">
                                      <VerdictIcon verdict={c.verdict} />
                                      <span className="font-medium">
                                        {c.hidden ? "Hidden case" : "Sample case"}: {c.label}
                                      </span>
                                      <span className="text-muted-foreground">· {VERDICT_LABEL[c.verdict]}</span>
                                    </p>
                                    {!c.hidden && c.verdict === "WRONG_ANSWER" && (
                                      <div className="grid gap-3 sm:grid-cols-2">
                                        <Block label="Your output">{c.actual || "(nothing printed)"}</Block>
                                        <Block label={isSql ? "Expected rows" : "Expected output"}>
                                          {expectedByLabel.get(c.label) ?? ""}
                                        </Block>
                                      </div>
                                    )}
                                    {!c.hidden && c.stderr && <Block label="Error output">{c.stderr}</Block>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}