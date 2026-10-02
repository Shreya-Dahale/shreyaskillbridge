import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCandidate } from "@/lib/candidate";
import { resumeExtractionSchema } from "@/lib/ai/schemas";
import { CURRENT_WORDS, parseResumeDate } from "@/lib/skills/dates";
import { detectGaps } from "@/lib/skills/gaps";
import { confirmReview } from "@/app/actions/review";

const errors: Record<string, string> = {
  invalid: "Please check that each ticked role has a job title and company.",
  dates: "Please check the dates. Every ticked role needs a start date, and an end date can't be before its start.",
  skills: "Please check your skills: names are required, years must be 0-60, and last used must be a valid year.",
  empty: "Nothing is selected to import.",
};

const input = "w-full rounded border p-2";
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
const yearOnly = (v?: string) => !!v && /^\d{4}$/.test(v.trim());
const isCurrent = (v?: string) => !!v && CURRENT_WORDS.includes(v.trim().toLowerCase());
const BLANK_SKILL_ROWS = 3;

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ resumeId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { resumeId } = await params;
  const { error } = await searchParams;
  const profile = await requireCandidate();

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, candidateId: profile.id },
  });
  if (!resume || resume.extractionJson == null) redirect("/candidate/resume");

  const parsed = resumeExtractionSchema.safeParse(resume.extractionJson);
  if (!parsed.success) redirect("/candidate/resume?error=ai");
  const draft = parsed.data;

  const today = new Date();
  const thisYear = today.getFullYear();

  const roles = draft.roles.map((r) => ({
    ...r,
    start: parseResumeDate(r.startDate, "start", today),
    end: parseResumeDate(r.endDate, "end", today),
  }));

  const ranges = roles.flatMap((r) =>
    r.start && r.end ? [{ start: r.start, end: r.end }] : []
  );
  const gaps = detectGaps(ranges, today);

  const skillRows = draft.skills.length + BLANK_SKILL_ROWS;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Review what we found</h1>
        <p className="mt-1 text-sm text-gray-600">
          The AI read your resume and may have made mistakes. Nothing is saved to your profile until
          you confirm. Untick anything that is wrong and correct anything that is off.
        </p>
      </div>

      {error && (
        <p className="rounded border border-red-300 p-3 text-sm text-red-700">
          {errors[error] ?? "Something went wrong."}
        </p>
      )}

      <form action={confirmReview} className="space-y-10">
        <input type="hidden" name="resumeId" value={resume.id} />
        <input type="hidden" name="roleCount" value={roles.length} />
        <input type="hidden" name="skillCount" value={skillRows} />
        <input type="hidden" name="gapCount" value={gaps.length} />

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Roles</h2>
          {roles.length === 0 && <p className="text-sm text-gray-500">No roles were found.</p>}
          <ul className="space-y-3">
            {roles.map((r, i) => (
              <li key={i} className="space-y-2 rounded border p-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" name={`role.${i}.include`} defaultChecked />
                  Import this role
                </label>
                <input name={`role.${i}.jobTitle`} defaultValue={r.jobTitle} placeholder="Job title" className={input} />
                <input name={`role.${i}.company`} defaultValue={r.company} placeholder="Company" className={input} />
                <div className="flex gap-2">
                  <label className="flex-1 text-sm">
                    Start date
                    <input name={`role.${i}.startDate`} type="date" defaultValue={iso(r.start)} className={input} />
                  </label>
                  <label className="flex-1 text-sm">
                    End date (blank if current)
                    <input
                      name={`role.${i}.endDate`}
                      type="date"
                      defaultValue={isCurrent(r.endDate) ? "" : iso(r.end)}
                      className={input}
                    />
                  </label>
                </div>
                {!r.start && (
                  <p className="text-xs text-amber-700">No usable start date found. Please add one to import this role.</p>
                )}
                {!r.endDate && (
                  <p className="text-xs text-amber-700">No end date found. Leave it blank only if this is your current role.</p>
                )}
                {(yearOnly(r.startDate) || yearOnly(r.endDate)) && (
                  <p className="text-xs text-amber-700">Only the year was found for this role. Please check the exact months.</p>
                )}
                <textarea
                  name={`role.${i}.description`}
                  defaultValue={r.description ?? ""}
                  placeholder="Description (optional)"
                  rows={2}
                  className={input}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Skills</h2>
          <p className="text-sm text-gray-500">
            Years and last-used year are optional. They help later when we compare your skills with a job.
          </p>
          <div className="flex gap-2 pl-6 text-xs text-gray-500">
            <span className="flex-1">Skill</span>
            <span className="w-24">Years</span>
            <span className="w-28">Last used</span>
          </div>
          <ul className="space-y-2">
            {Array.from({ length: skillRows }, (_, i) => {
              const s = draft.skills[i];
              return (
                <li key={i} className="flex items-center gap-2">
                  {s ? (
                    <input type="checkbox" name={`skill.${i}.include`} defaultChecked aria-label="Import this skill" />
                  ) : (
                    <span className="w-4" />
                  )}
                  <input
                    name={`skill.${i}.name`}
                    defaultValue={s?.name ?? ""}
                    placeholder={s ? "Skill" : "Add another skill"}
                    className={`${input} flex-1`}
                  />
                  <input
                    name={`skill.${i}.years`}
                    type="number"
                    step="0.5"
                    min="0"
                    max="60"
                    defaultValue={s?.yearsExperience ?? ""}
                    placeholder="Years"
                    className="w-24 rounded border p-2"
                  />
                  <input
                    name={`skill.${i}.last`}
                    type="number"
                    min="1980"
                    max={thisYear + 1}
                    defaultValue={s?.lastUsedYear ?? ""}
                    placeholder="Year"
                    className="w-28 rounded border p-2"
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Possible career break</h2>
          {gaps.length === 0 ? (
            <p className="text-sm text-gray-500">
              No gaps were detected between the roles on your resume.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Based on the dates on your resume, there may be a period without a listed role. This is only a
                suggestion, and it is added to your profile only if you tick it. You never need to explain a break.
              </p>
              <ul className="space-y-3">
                {gaps.map((g, i) => (
                  <li key={i} className="space-y-2 rounded border p-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input type="checkbox" name={`gap.${i}.include`} />
                      Add this as a career break
                    </label>
                    <div className="flex gap-2">
                      <label className="flex-1 text-sm">
                        Start date
                        <input name={`gap.${i}.startDate`} type="date" defaultValue={iso(g.start)} className={input} />
                      </label>
                      <label className="flex-1 text-sm">
                        End date (blank if ongoing)
                        <input name={`gap.${i}.endDate`} type="date" defaultValue={iso(g.end)} className={input} />
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <div className="flex items-center gap-4">
          <button className="rounded bg-black px-5 py-2 text-white">Save to my profile</button>
          <Link href="/candidate/resume" className="text-sm underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}