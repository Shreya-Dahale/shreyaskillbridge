import Link from "next/link";
import { CheckCircle2, ChevronRight, Circle, ListChecks, PlayCircle } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";

const KIND_LABEL = { JAVA_CODE: "Java", SQL: "SQL", PROJECT: "Project" } as const;

export default async function TasksPage() {
  const profile = await requireCandidate();

  const [tasks, submissions] = await Promise.all([
    prisma.task.findMany({
      where: { active: true, kind: { in: ["JAVA_CODE", "SQL"] } },
      orderBy: { slug: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        kind: true,
        skills: { select: { skill: { select: { name: true } } } },
      },
    }),
    prisma.submission.findMany({
      where: { candidateId: profile.id },
      select: { taskId: true, status: true },
    }),
  ]);

  const passedIds = new Set(submissions.filter((s) => s.status === "PASSED").map((s) => s.taskId));
  const attempts = new Map<string, number>();
  for (const s of submissions) attempts.set(s.taskId, (attempts.get(s.taskId) ?? 0) + 1);

  const groups = new Map<string, typeof tasks>();
  for (const task of tasks) {
    const key = task.skills[0]?.skill.name ?? "Other";
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }
  const groupNames = Array.from(groups.keys()).sort();

  const passedCount = tasks.filter((t) => passedIds.has(t.id)).length;
  const pct = tasks.length > 0 ? (passedCount / tasks.length) * 100 : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Practice tasks"
        description="Short coding tasks that show what you can do today. They are optional, they build evidence you choose to share, and you can try each one as many times as you like."
      />

      {tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title="No tasks are available yet" />
      ) : (
        <>
          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {passedCount} of {tasks.length} tasks passed
                </span>
              </div>
              <div
                role="img"
                aria-label={`${passedCount} of ${tasks.length} tasks passed`}
                className="h-2 overflow-hidden rounded-full bg-muted"
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </CardContent>
          </Card>

          {groupNames.map((name) => (
            <section key={name} className="space-y-3">
              <h2 className="text-lg font-semibold">{name}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {groups.get(name)!.map((task) => {
                  const passed = passedIds.has(task.id);
                  const tries = attempts.get(task.id) ?? 0;
                  return (
                    <li key={task.id}>
                      <Link
                        href={`/candidate/tasks/${task.slug}`}
                        className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Card className="h-full transition-shadow group-hover:shadow-md">
                          <CardContent className="flex h-full flex-col gap-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium">{task.title}</p>
                              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="outline">{KIND_LABEL[task.kind]}</Badge>
                              {task.skills.map((s) => (
                                <Badge key={s.skill.name} variant="secondary">
                                  {s.skill.name}
                                </Badge>
                              ))}
                            </div>
                            <p className="mt-auto flex items-center gap-1.5 text-xs">
                              {passed ? (
                                <>
                                  <CheckCircle2 className="size-4 text-green-600" aria-hidden="true" />
                                  <span className="font-medium text-green-700">Passed</span>
                                </>
                              ) : tries > 0 ? (
                                <>
                                  <PlayCircle className="size-4 text-amber-600" aria-hidden="true" />
                                  <span className="text-amber-700">
                                    {tries} {tries === 1 ? "attempt" : "attempts"}, not passed yet
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Circle className="size-4 text-muted-foreground" aria-hidden="true" />
                                  <span className="text-muted-foreground">Not attempted</span>
                                </>
                              )}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}