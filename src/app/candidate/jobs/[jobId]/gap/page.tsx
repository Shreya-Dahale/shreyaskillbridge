import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCandidate } from "@/lib/candidate";
import { loadGapAnalysis } from "@/lib/skills/load-gaps";
import { explainGap, STATUS_LABEL, STATUS_STYLE } from "@/lib/skills/describe";
import type { SkillGap, SkillStatus } from "@/lib/skills/gap-engine";

function summary(items: SkillGap[]) {
  return (Object.keys(STATUS_LABEL) as SkillStatus[])
    .map((status) => ({ status, n: items.filter((g) => g.status === status).length }))
    .filter((x) => x.n > 0);
}

function Group({ title, items }: { title: string; items: SkillGap[] }) {
  return (
    <section className="space-y-3">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">{title}</h2>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {summary(items).map(({ status, n }) => (
              <span key={status} className={`rounded px-2 py-1 ${STATUS_STYLE[status]}`}>
                {n} {STATUS_LABEL[status].toLowerCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      {items.length === 0 && <p className="text-sm text-gray-500">None listed.</p>}

      <ul className="space-y-3">
        {items.map((gap) => {
          const { lines, hint } = explainGap(gap);
          return (
            <li key={gap.skillId} className="space-y-1 rounded border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">
                  {gap.name}
                  {gap.minYears != null && (
                    <span className="font-normal text-gray-500"> · {gap.minYears}+ yrs asked</span>
                  )}
                </p>
                <span className={`whitespace-nowrap rounded px-2 py-1 text-xs ${STATUS_STYLE[gap.status]}`}>
                  {STATUS_LABEL[gap.status]}
                </span>
              </div>
              <ul className="space-y-0.5 text-sm text-gray-700">
                {lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {hint && <p className="text-sm text-gray-500">{hint}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default async function GapPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const profile = await requireCandidate();

  const result = await loadGapAnalysis(profile.id, jobId);
  if (!result) notFound();

  const { job, gaps, hasSkills } = result;
  const required = gaps.filter((g) => g.importance === "REQUIRED");
  const preferred = gaps.filter((g) => g.importance === "PREFERRED");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href={`/candidate/jobs/${job.id}`} className="text-sm underline">
        &larr; Back to job
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">How you compare</h1>
        <p className="text-sm text-gray-500">
          {job.title} · {job.employer.companyName}
        </p>
        <p className="text-sm text-gray-600">
          This compares the skills on your profile with what the job asks for. It is based only on your
          skills and any assessments you complete. Your career break is not part of this comparison, and
          the result is not a score. Every status comes with a reason.
        </p>
      </div>

      {!hasSkills && (
        <p className="rounded border border-amber-300 p-3 text-sm text-amber-800">
          Your profile has no skills yet, so everything below shows as not yet demonstrated.{" "}
          <Link href="/candidate/resume" className="underline">
            Upload a resume
          </Link>{" "}
          to add your skills.
        </p>
      )}

      <Group title="Required skills" items={required} />
      <Group title="Preferred skills" items={preferred} />
    </div>
  );
}