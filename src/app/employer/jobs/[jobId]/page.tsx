import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";
import { deleteJob, analyzeJob } from "@/app/actions/jobs";
import { setJobStatus } from "@/app/actions/requirements";

const statusLabel = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
} as const;

const errors: Record<string, string> = {
  ai: "The AI analysis failed. Please try again in a moment.",
  norequired: "Add at least one required skill before publishing.",
};

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { jobId } = await params;
  const { error, saved } = await searchParams;
  const profile = await requireEmployer();

  const job = await prisma.job.findFirst({
    where: { id: jobId, employerId: profile.id },
    include: {
      skills: {
        include: { skill: true },
        orderBy: [{ importance: "asc" }, { skill: { name: "asc" } }],
      },
    },
  });
  if (!job) notFound();

  const required = job.skills.filter((s) => s.importance === "REQUIRED");
  const preferred = job.skills.filter((s) => s.importance === "PREFERRED");
  const hasSkills = job.skills.length > 0;
  const button = "whitespace-nowrap rounded border px-3 py-1";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/employer/jobs" className="text-sm underline">
        &larr; All jobs
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{job.title}</h1>
        <p className="text-sm text-gray-500">
          {statusLabel[job.status]} · created {job.createdAt.toLocaleDateString("en-GB")}
        </p>
      </div>

      {saved && (
        <p className="rounded border border-green-300 p-3 text-sm text-green-800">
          Requirements saved.
        </p>
      )}
      {error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">
          {errors[error] ?? "Something went wrong."}
        </p>
      )}

      <section className="space-y-3 rounded border p-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Requirements</h2>
          {hasSkills && (
            <Link href={`/employer/jobs/${job.id}/review`} className={`${button} text-sm underline`}>
              Edit requirements
            </Link>
          )}
        </div>

        {hasSkills ? (
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Required</p>
              {required.length === 0 ? (
                <p className="text-gray-500">None yet. Add at least one to publish.</p>
              ) : (
                <ul className="mt-1 list-inside list-disc">
                  {required.map((s) => (
                    <li key={s.id}>
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
                <p className="text-gray-500">None.</p>
              ) : (
                <ul className="mt-1 list-inside list-disc">
                  {preferred.map((s) => (
                    <li key={s.id}>
                      {s.skill.name}
                      {s.minYears != null && ` (${s.minYears}+ yrs)`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-gray-600">
                {job.extractedAt
                  ? `AI analysis done on ${job.extractedAt.toLocaleString("en-GB")}. Review it to confirm the requirements.`
                  : "Not analyzed yet."}
              </p>
              <div className="flex gap-2">
                {job.extractedAt && (
                  <Link
                    href={`/employer/jobs/${job.id}/review`}
                    className="whitespace-nowrap rounded bg-black px-3 py-1 text-white"
                  >
                    Review requirements
                  </Link>
                )}
                <form action={analyzeJob}>
                  <input type="hidden" name="id" value={job.id} />
                  <button className={button}>
                    {job.extractedAt ? "Re-run analysis" : "Analyze with AI"}
                  </button>
                </form>
              </div>
            </div>
            {job.extractionJson != null && (
              <details>
                <summary className="cursor-pointer">View AI result (raw)</summary>
                <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded border p-3 text-xs">
                  {JSON.stringify(job.extractionJson, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </section>

      <section className="space-y-2 rounded border p-3 text-sm">
        <h2 className="text-lg font-medium">Status</h2>
        <div className="flex flex-wrap gap-2">
          {job.status === "DRAFT" && (
            <form action={setJobStatus}>
              <input type="hidden" name="id" value={job.id} />
              <input type="hidden" name="status" value="PUBLISHED" />
              <button className="rounded bg-black px-3 py-1 text-white">Publish</button>
            </form>
          )}
          {job.status === "PUBLISHED" && (
            <>
              <form action={setJobStatus}>
                <input type="hidden" name="id" value={job.id} />
                <input type="hidden" name="status" value="DRAFT" />
                <button className={button}>Move back to draft</button>
              </form>
              <form action={setJobStatus}>
                <input type="hidden" name="id" value={job.id} />
                <input type="hidden" name="status" value="CLOSED" />
                <button className={button}>Close job</button>
              </form>
            </>
          )}
          {job.status === "CLOSED" && (
            <form action={setJobStatus}>
              <input type="hidden" name="id" value={job.id} />
              <input type="hidden" name="status" value="DRAFT" />
              <button className={button}>Reopen as draft</button>
            </form>
          )}
        </div>
        <p className="text-gray-500">
          Candidates will be able to find published jobs once the skill-gap feature is built.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Job description</h2>
        <pre className="whitespace-pre-wrap rounded border p-3 font-sans text-sm">
          {job.description}
        </pre>
      </section>

      <details className="rounded border p-3 text-sm">
        <summary className="cursor-pointer text-red-700">Delete this job</summary>
        <form action={deleteJob} className="mt-3 space-y-2">
          <input type="hidden" name="id" value={job.id} />
          <p>This permanently deletes the job and its requirements.</p>
          <button className="rounded bg-red-600 px-3 py-1 text-white">Yes, delete this job</button>
        </form>
      </details>
    </div>
  );
}