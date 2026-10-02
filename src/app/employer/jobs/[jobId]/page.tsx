import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";
import { deleteJob, analyzeJob } from "@/app/actions/jobs";

const statusLabel = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
} as const;

const errors: Record<string, string> = {
  ai: "The AI analysis failed. Please try again in a moment.",
};

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { jobId } = await params;
  const { error } = await searchParams;
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

      {error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">
          {errors[error] ?? "Something went wrong."}
        </p>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Job description</h2>
        <pre className="whitespace-pre-wrap rounded border p-3 font-sans text-sm">
          {job.description}
        </pre>
      </section>

      <section className="space-y-3 rounded border p-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-gray-600">
            {job.extractedAt
              ? `AI analysis done on ${job.extractedAt.toLocaleString("en-GB")}`
              : "Requirements: not analyzed yet."}
          </p>
          <form action={analyzeJob}>
            <input type="hidden" name="id" value={job.id} />
            <button className="whitespace-nowrap rounded bg-black px-3 py-1 text-white">
              {job.extractedAt ? "Re-run analysis" : "Analyze with AI"}
            </button>
          </form>
        </div>

        {job.extractionJson != null && (
          <details className="text-sm">
            <summary className="cursor-pointer">View AI result (raw)</summary>
            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded border p-3 text-xs">
              {JSON.stringify(job.extractionJson, null, 2)}
            </pre>
          </details>
        )}
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