import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";

export const statusLabel = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
} as const;

export default async function JobsPage() {
  const profile = await requireEmployer();
  const jobs = await prisma.job.findMany({
    where: { employerId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { skills: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your jobs</h1>
        <Link href="/employer/jobs/new" className="rounded bg-black px-4 py-2 text-white">
          New job
        </Link>
      </div>

      {jobs.length === 0 && (
        <p className="text-sm text-gray-500">You haven&apos;t created any jobs yet.</p>
      )}

      <ul className="space-y-3">
        {jobs.map((job) => (
          <li key={job.id} className="rounded border p-3">
            <Link href={`/employer/jobs/${job.id}`} className="font-medium underline">
              {job.title}
            </Link>
            <p className="text-sm text-gray-500">
              {statusLabel[job.status]} · {job._count.skills} requirements ·{" "}
              {job.createdAt.toLocaleDateString("en-GB")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}