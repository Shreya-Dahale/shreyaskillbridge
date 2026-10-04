import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveRequirements } from "@/app/actions/requirements";
import { jobExtractionSchema } from "@/lib/ai/schemas";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";

const errors: Record<string, string> = {
  skills:
    "Please check your skills: every ticked row needs a name (up to 60 characters), and years must be between 0 and 60.",
};

const BLANK_ROWS = 3;
const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

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
      <PageHeader
        title="Review requirements"
        description={`For ${job.title}. The AI suggested these from your description and may have made mistakes. Untick anything that doesn't belong, set each skill as required or preferred, and add anything missing. Nothing is saved until you confirm.`}
        back={{ href: `/employer/jobs/${job.id}`, label: "Back to job" }}
      />

      {error && <Notice tone="error">{errors[error] ?? "Something went wrong."}</Notice>}

      <form action={saveRequirements} className="space-y-6">
        <input type="hidden" name="jobId" value={job.id} />
        <input type="hidden" name="rowCount" value={rowCount} />
        <input type="hidden" name="prefillCount" value={rows.length} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills</CardTitle>
            <CardDescription>
              Use the blank rows to add skills the AI missed. Minimum years is optional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="hidden gap-2 pl-6 text-xs text-muted-foreground sm:flex">
              <span className="flex-1">Skill</span>
              <span className="w-32">Importance</span>
              <span className="w-24">Min. years</span>
            </div>
            {Array.from({ length: rowCount }, (_, i) => {
              const r = rows[i];
              return (
                <div key={i} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  {r ? (
                    <input
                      type="checkbox"
                      name={`skill.${i}.include`}
                      defaultChecked
                      aria-label={`Keep ${r.name}`}
                      className="size-4 accent-primary"
                    />
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                  <Input
                    name={`skill.${i}.name`}
                    aria-label={r ? `Skill ${i + 1} name` : "Add another skill"}
                    defaultValue={r?.name ?? ""}
                    placeholder={r ? "Skill" : "Add another skill"}
                    maxLength={60}
                    className="min-w-40 flex-1"
                  />
                  <select
                    name={`skill.${i}.importance`}
                    aria-label={`Skill ${i + 1} importance`}
                    defaultValue={r?.importance ?? "REQUIRED"}
                    className={`${selectClass} w-32`}
                  >
                    <option value="REQUIRED">Required</option>
                    <option value="PREFERRED">Preferred</option>
                  </select>
                  <Input
                    name={`skill.${i}.years`}
                    aria-label={`Skill ${i + 1} minimum years`}
                    type="number"
                    step="0.5"
                    min="0"
                    max="60"
                    defaultValue={r?.minYears ?? ""}
                    placeholder="Years"
                    className="w-24"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">Save requirements</Button>
          <Link href={`/employer/jobs/${job.id}`} className={buttonVariants({ variant: "ghost" })}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}