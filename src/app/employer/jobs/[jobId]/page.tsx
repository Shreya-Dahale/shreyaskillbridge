import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";
import { deleteJob } from "@/app/actions/jobs";

const statusLabel = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
} as const;

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const profile = await requireEmployer();

  const job = await prisma.job.findFirst({
    where: { id: jobId, employerId: profile.id },
  });
  if (!job) notFound();

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

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Job description</h2>
        <pre className="whitespace-pre-wrap rounded border p-3 font-sans text-sm">
          {job.description}
        </pre>
      </section>

      <section className="rounded border p-3 text-sm text-gray-600">
        Requirements: not analyzed yet. AI analysis comes in the next step.
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