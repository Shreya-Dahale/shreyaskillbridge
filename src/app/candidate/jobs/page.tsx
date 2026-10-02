import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { addTarget, removeTarget } from "@/app/actions/targets";

const errors: Record<string, string> = {
  unavailable: "That job is no longer available.",
  max: "You can target up to 5 jobs. Remove one to add another.",
};

export default async function CandidateJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const profile = await requireCandidate();

  const [jobs, targets] = await Promise.all([
    prisma.job.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        employer: { select: { companyName: true } },
        _count: { select: { skills: true } },
      },
    }),
    prisma.targetJob.findMany({
      where: { candidateId: profile.id },
      orderBy: { createdAt: "desc" },
      select: {
        jobId: true,
        job: {
          select: {
            title: true,
            status: true,
            employer: { select: { companyName: true } },
          },
        },
      },
    }),
  ]);

  const targetIds = new Set(targets.map((t) => t.jobId));

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold">Jobs</h1>

      {error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">
          {errors[error] ?? "Something went wrong."}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your target jobs ({targets.length}/5)</h2>
        {targets.length === 0 && (
          <p className="text-sm text-gray-500">
            You haven&apos;t chosen a target job yet. Pick one below to see how your skills compare.
          </p>
        )}
        <ul className="space-y-2">
          {targets.map((t) => {
            const open = t.job.status === "PUBLISHED";
            return (
              <li key={t.jobId} className="flex items-center justify-between rounded border p-3">
                <div>
                  {open ? (
                    <Link href={`/candidate/jobs/${t.jobId}`} className="font-medium underline">
                      {t.job.title}
                    </Link>
                  ) : (
                    <span className="font-medium">{t.job.title}</span>
                  )}
                  <p className="text-sm text-gray-500">
                    {t.job.employer.companyName}
                    {!open && " · No longer open"}
                  </p>
                </div>
                <form action={removeTarget}>
                  <input type="hidden" name="jobId" value={t.jobId} />
                  <button className="text-sm text-red-600 underline">Remove</button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Open jobs</h2>
        {jobs.length === 0 && (
          <p className="text-sm text-gray-500">No jobs are open right now.</p>
        )}
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <Link href={`/candidate/jobs/${job.id}`} className="font-medium underline">
                  {job.title}
                </Link>
                <p className="text-sm text-gray-500">
                  {job.employer.companyName} · {job._count.skills} requirements ·{" "}
                  {job.createdAt.toLocaleDateString("en-GB")}
                </p>
              </div>
              {targetIds.has(job.id) ? (
                <span className="text-sm text-green-700">Targeted</span>
              ) : (
                <form action={addTarget}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button className="rounded border px-3 py-1 text-sm">Set as target</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}