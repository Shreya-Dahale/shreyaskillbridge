import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";

export default async function TasksPage() {
  const profile = await requireCandidate();

  const [tasks, submissions] = await Promise.all([
    prisma.task.findMany({
      where: { active: true, kind: "JAVA_CODE" },
      orderBy: { slug: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        skills: { select: { skill: { select: { name: true } } } },
      },
    }),
    prisma.submission.findMany({
      where: { candidateId: profile.id },
      select: { taskId: true, status: true },
    }),
  ]);

  function progress(taskId: string) {
    const mine = submissions.filter((s) => s.taskId === taskId);
    if (mine.length === 0) return "Not attempted";
    if (mine.some((s) => s.status === "PASSED")) return "Passed";
    return `${mine.length} attempt${mine.length === 1 ? "" : "s"}`;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Practice tasks</h1>
        <p className="mt-1 text-sm text-gray-600">
          Short coding tasks that show what you can do today. They are optional, and they build evidence you
          choose to share. You can try a task as many times as you like.
        </p>
      </div>

      {tasks.length === 0 && <p className="text-sm text-gray-500">No tasks are available yet.</p>}

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <Link href={`/candidate/tasks/${task.slug}`} className="font-medium underline">
                {task.title}
              </Link>
              <p className="text-sm text-gray-500">
                Builds evidence for: {task.skills.map((s) => s.skill.name).join(", ")}
              </p>
            </div>
            <span className="whitespace-nowrap text-sm text-gray-600">{progress(task.id)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}