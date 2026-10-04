import Link from "next/link";
import { redirect } from "next/navigation";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { confirmReview } from "@/app/actions/review";
import { resumeExtractionSchema } from "@/lib/ai/schemas";
import { requireCandidate } from "@/lib/candidate";
import { prisma } from "@/lib/db";
import { CURRENT_WORDS, parseResumeDate } from "@/lib/skills/dates";
import { detectGaps } from "@/lib/skills/gaps";

const errors: Record<string, string> = {
  invalid: "Please check that each ticked role has a job title and company.",
  dates:
    "Please check the dates. Every ticked role needs a start date, and an end date can't be before its start.",
  skills: "Please check your skills: names are required, years must be 0-60, and last used must be a valid year.",
  empty: "Nothing is selected to import.",
};

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
const yearOnly = (v?: string) => !!v && /^\d{4}$/.test(v.trim());
const isCurrent = (v?: string) => !!v && CURRENT_WORDS.includes(v.trim().toLowerCase());
const BLANK_SKILL_ROWS = 3;
const checkbox = "size-4 accent-primary";

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

  const ranges = roles.flatMap((r) => (r.start && r.end ? [{ start: r.start, end: r.end }] : []));
  const gaps = detectGaps(ranges, today);

  const skillRows = draft.skills.length + BLANK_SKILL_ROWS;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Review what we found"
        description="The AI read your resume and may have made mistakes. Nothing is saved to your profile until you confirm. Untick anything that is wrong and correct anything that is off."
        back={{ href: "/candidate/resume", label: "Back to resume" }}
      />

      {error && <Notice tone="error">{errors[error] ?? "Something went wrong."}</Notice>}

      <form action={confirmReview} className="space-y-6">
        <input type="hidden" name="resumeId" value={resume.id} />
        <input type="hidden" name="roleCount" value={roles.length} />
        <input type="hidden" name="skillCount" value={skillRows} />
        <input type="hidden" name="gapCount" value={gaps.length} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles</CardTitle>
            <CardDescription>Dates matter most, because they are used to spot a possible career break.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.length === 0 && <p className="text-sm text-muted-foreground">No roles were found.</p>}
            {roles.map((r, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" name={`role.${i}.include`} defaultChecked className={checkbox} />
                  Import this role
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`role-${i}-title`}>Job title</Label>
                    <Input id={`role-${i}-title`} name={`role.${i}.jobTitle`} defaultValue={r.jobTitle} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`role-${i}-company`}>Company</Label>
                    <Input id={`role-${i}-company`} name={`role.${i}.company`} defaultValue={r.company} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`role-${i}-start`}>Start date</Label>
                    <Input id={`role-${i}-start`} name={`role.${i}.startDate`} type="date" defaultValue={iso(r.start)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`role-${i}-end`}>End date (blank if current)</Label>
                    <Input
                      id={`role-${i}-end`}
                      name={`role.${i}.endDate`}
                      type="date"
                      defaultValue={isCurrent(r.endDate) ? "" : iso(r.end)}
                    />
                  </div>
                </div>
                {!r.start && (
                  <p className="text-xs text-amber-700">No usable start date found. Please add one to import this role.</p>
                )}
                {!r.endDate && (
                  <p className="text-xs text-amber-700">
                    No end date found. Leave it blank only if this is your current role.
                  </p>
                )}
                {(yearOnly(r.startDate) || yearOnly(r.endDate)) && (
                  <p className="text-xs text-amber-700">Only the year was found for this role. Please check the exact months.</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor={`role-${i}-description`}>Description (optional)</Label>
                  <Textarea
                    id={`role-${i}-description`}
                    name={`role.${i}.description`}
                    defaultValue={r.description ?? ""}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills</CardTitle>
            <CardDescription>
              Years and last-used year are optional. They help later when we compare your skills with a job. Use the
              blank rows to add skills the AI missed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="hidden gap-2 pl-6 text-xs text-muted-foreground sm:flex">
              <span className="flex-1">Skill</span>
              <span className="w-24">Years</span>
              <span className="w-28">Last used</span>
            </div>
            {Array.from({ length: skillRows }, (_, i) => {
              const s = draft.skills[i];
              return (
                <div key={i} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  {s ? (
                    <input
                      type="checkbox"
                      name={`skill.${i}.include`}
                      defaultChecked
                      aria-label={`Import ${s.name}`}
                      className={checkbox}
                    />
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                  <Input
                    name={`skill.${i}.name`}
                    aria-label={s ? `Skill ${i + 1} name` : "Add another skill"}
                    defaultValue={s?.name ?? ""}
                    placeholder={s ? "Skill" : "Add another skill"}
                    className="min-w-40 flex-1"
                  />
                  <Input
                    name={`skill.${i}.years`}
                    aria-label={`Skill ${i + 1} years`}
                    type="number"
                    step="0.5"
                    min="0"
                    max="60"
                    defaultValue={s?.yearsExperience ?? ""}
                    placeholder="Years"
                    className="w-24"
                  />
                  <Input
                    name={`skill.${i}.last`}
                    aria-label={`Skill ${i + 1} last used year`}
                    type="number"
                    min="1980"
                    max={thisYear + 1}
                    defaultValue={s?.lastUsedYear ?? ""}
                    placeholder="Year"
                    className="w-28"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Possible career break</CardTitle>
            <CardDescription>
              {gaps.length === 0
                ? "No gaps were detected between the roles on your resume."
                : "Based on the dates on your resume, there may be a period without a listed role. This is only a suggestion, and it is added to your profile only if you tick it. You never need to explain a break."}
            </CardDescription>
          </CardHeader>
          {gaps.length > 0 && (
            <CardContent className="space-y-3">
              {gaps.map((g, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-4">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" name={`gap.${i}.include`} className={checkbox} />
                    Add this as a career break
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`gap-${i}-start`}>Start date</Label>
                      <Input id={`gap-${i}-start`} name={`gap.${i}.startDate`} type="date" defaultValue={iso(g.start)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`gap-${i}-end`}>End date (blank if ongoing)</Label>
                      <Input id={`gap-${i}-end`} name={`gap.${i}.endDate`} type="date" defaultValue={iso(g.end)} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">Save to my profile</Button>
          <Link href="/candidate/resume" className={buttonVariants({ variant: "ghost" })}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}