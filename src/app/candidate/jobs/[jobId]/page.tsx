import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { addTarget, removeTarget } from "@/app/actions/targets";

export default async function CandidateJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const profile = await requireCandidate();

  const job = await prisma.job.findFirst({
    where: { id: jobId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      employer: { select: { companyName: true, website: true, about: true } },
      skills: {
        select: { importance: true, minYears: true, skill: { select: { name: true } } },
        orderBy: [{ importance: "asc" }, { skill: { name: "asc" } }],
      },
    },
  });
  if (!job) notFound();

  const target = await prisma.targetJob.findUnique({
    where: { candidateId_jobId: { candidateId: profile.id, jobId: job.id } },
  });

  const required = job.skills.filter((s) => s.importance === "REQUIRED");
  const preferred = job.skills.filter((s) => s.importance === "PREFERRED");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/candidate/jobs" className="text-sm underline">
        &larr; All jobs
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{job.title}</h1>
          <p className="text-sm text-gray-500">
            {job.employer.companyName} · posted {job.createdAt.toLocaleDateString("en-GB")}
          </p>
        </div>
        {target ? (
          <form action={removeTarget}>
            <input type="hidden" name="jobId" value={job.id} />
            <button className="whitespace-nowrap rounded border px-3 py-1 text-sm">
              Targeted · Remove
            </button>
          </form>
        ) : (
          <form action={addTarget}>
            <input type="hidden" name="jobId" value={job.id} />
            <button className="whitespace-nowrap rounded bg-black px-3 py-1 text-sm text-white">
              Set as target
            </button>
          </form>
        )}
      </div>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-medium">Requirements</h2>
        <div>
          <p className="font-medium">Required</p>
          {required.length === 0 ? (
            <p className="text-gray-500">None listed.</p>
          ) : (
            <ul className="mt-1 list-inside list-disc">
              {required.map((s) => (
                <li key={s.skill.name}>
                  {s.skill.name}
                  {s.minYears != null && ` (${s.minYears}+ yrs)`}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="font-medium">Preferred</p>
          {preferred.length === 0 ? (
            <p className="text-gray-500">None listed.</p>
          ) : (
            <ul className="mt-1 list-inside list-disc">
              {preferred.map((s) => (
                <li key={s.skill.name}>
                  {s.skill.name}
                  {s.minYears != null && ` (${s.minYears}+ yrs)`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {(job.employer.about || job.employer.website) && (
        <section className="space-y-1 text-sm">
          <h2 className="text-lg font-medium">About {job.employer.companyName}</h2>
          {job.employer.about && <p>{job.employer.about}</p>}
          {job.employer.website && (
            <a href={job.employer.website} target="_blank" rel="noreferrer" className="underline">
              {job.employer.website}
            </a>
          )}
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Job description</h2>
        <pre className="whitespace-pre-wrap rounded border p-3 font-sans text-sm">
          {job.description}
        </pre>
      </section>
    </div>
  );
}