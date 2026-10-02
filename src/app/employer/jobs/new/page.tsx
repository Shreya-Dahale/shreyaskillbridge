import { requireEmployer } from "@/lib/employer";
import { createJob } from "@/app/actions/jobs";

const input = "w-full rounded border p-2";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  await requireEmployer();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New job</h1>
      <p className="text-sm text-gray-600">
        Paste the full job description. In the next step the AI will suggest the required and preferred
        skills, and you will review them before anything is published.
      </p>

      {error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">
          Please enter a job title and a description of at least 50 characters (up to 10,000).
        </p>
      )}

      <form action={createJob} className="space-y-4">
        <label className="block text-sm font-medium">
          Job title
          <input
            name="title"
            required
            maxLength={100}
            placeholder="e.g. Java Backend Developer"
            className={`${input} mt-1`}
          />
        </label>
        <label className="block text-sm font-medium">
          Job description
          <textarea
            name="description"
            required
            minLength={50}
            maxLength={10000}
            rows={14}
            placeholder="Paste the job description here"
            className={`${input} mt-1`}
          />
        </label>
        <button className="rounded bg-black px-4 py-2 text-white">Create job</button>
      </form>
    </div>
  );
}