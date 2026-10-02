import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";
import { jobExtractionSchema } from "@/lib/ai/schemas";
import { saveRequirements } from "@/app/actions/requirements";

const errors: Record<string, string> = {
  skills:
    "Please check your skills: every ticked row needs a name (up to 60 characters), and years must be between 0 and 60.",
};

const input = "rounded border p-2";
const BLANK_ROWS = 3;

type Row = { name: string; importance: "REQUIRED" | "PREFERRED"; minYears: number | null };

export default async function ReviewRequirementsPage({
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
    include: {
      skills: {
        include: { skill: true },
        orderBy: [{ importance: "asc" }, { skill: { name: "asc" } }],
      },
    },
  });
  if (!job) notFound();

  let rows: Row[];
  if (job.skills.length > 0) {
    rows = job.skills.map((js) => ({
      name: js.skill.name,
      importance: js.importance,
      minYears: js.minYears,
    }));
  } else {
    const parsed = jobExtractionSchema.safeParse(job.extractionJson);
    if (!parsed.success) redirect(`/employer/jobs/${job.id}`);
    rows = parsed.data.skills.map((s) => ({
      name: s.name,
      importance: s.importance === "required" ? ("REQUIRED" as const) : ("PREFERRED" as const),
      minYears: s.minYears ?? null,
    }));
  }

  const rowCount = rows.length + BLANK_ROWS;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/employer/jobs/${job.id}`} className="text-sm underline">
        &larr; Back to job
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Review requirements</h1>
        <p className="mt-1 text-sm text-gray-600">
          for <span className="font-medium">{job.title}</span>. The AI suggested these from your job
          description and may have made mistakes. Untick anything that doesn&apos;t belong, set each skill
          as required or preferred, and add anything missing. Nothing is saved until you confirm.
        </p>
      </div>

      {error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">
          {errors[error] ?? "Something went wrong."}
        </p>
      )}

      <form action={saveRequirements} className="space-y-6">
        <input type="hidden" name="jobId" value={job.id} />
        <input type="hidden" name="rowCount" value={rowCount} />
        <input type="hidden" name="prefillCount" value={rows.length} />

        <div className="flex gap-2 pl-6 text-xs text-gray-500">
          <span className="flex-1">Skill</span>
          <span className="w-32">Importance</span>
          <span className="w-24">Min. years</span>
        </div>

        <ul className="space-y-2">
          {Array.from({ length: rowCount }, (_, i) => {
            const r = rows[i];
            return (
              <li key={i} className="flex items-center gap-2">
                {r ? (
                  <input type="checkbox" name={`skill.${i}.include`} defaultChecked aria-label="Keep this requirement" />
                ) : (
                  <span className="w-4" />
                )}
                <input
                  name={`skill.${i}.name`}
                  defaultValue={r?.name ?? ""}
                  placeholder={r ? "Skill" : "Add another skill"}
                  maxLength={60}
                  className={`${input} flex-1`}
                />
                <select
                  name={`skill.${i}.importance`}
                  defaultValue={r?.importance ?? "REQUIRED"}
                  className={`${input} w-32`}
                >
                  <option value="REQUIRED">Required</option>
                  <option value="PREFERRED">Preferred</option>
                </select>
                <input
                  name={`skill.${i}.years`}
                  type="number"
                  step="0.5"
                  min="0"
                  max="60"
                  defaultValue={r?.minYears ?? ""}
                  placeholder="Years"
                  className={`${input} w-24`}
                />
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
          <button className="rounded bg-black px-5 py-2 text-white">Save requirements</button>
          <Link href={`/employer/jobs/${job.id}`} className="text-sm underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}