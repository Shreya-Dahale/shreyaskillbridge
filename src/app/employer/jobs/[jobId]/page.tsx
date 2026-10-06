import Link from "next/link";
import { notFound } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";
import { SubmitButton } from "@/components/SubmitButton";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeJob, deleteJob } from "@/app/actions/jobs";
import { setJobStatus } from "@/app/actions/requirements";
import { prisma } from "@/lib/db";
import { requireEmployer } from "@/lib/employer";
import {DEMO_MODE, DEMO_NOTE} from "@/lib/demo";

const errors: Record<string, string> = {
  ai: "The AI analysis failed. Please try again in a moment.",
  norequired: "Add at least one required skill before publishing.",
  demo: DEMO_NOTE,
};

function SkillChips({
  title,
  items,
  variant,
}: {
  title: string;
  items: { id: string; minYears: number | null; skill: { name: string } }[];
  variant: "secondary" | "outline";
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((s) => (
            <Badge key={s.id} variant={variant}>
              {s.skill.name}
              {s.minYears != null && ` · ${s.minYears}+ yrs`}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={job.title}
        description={`Created ${job.createdAt.toLocaleDateString("en-GB")}`}
        back={{ href: "/employer/jobs", label: "All jobs" }}
      >
        <div className="flex items-center gap-2">
          {job.status === "PUBLISHED" && (
            <Link href={`/employer/jobs/${job.id}/candidates`} className={buttonVariants()}>
              <Search /> Find candidates
            </Link>
          )}
          <JobStatusBadge status={job.status} />
        </div>
      </PageHeader>

      {saved && <Notice tone="success">Requirements saved.</Notice>}
      {error && <Notice tone="error">{errors[error] ?? "Something went wrong."}</Notice>}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Requirements</CardTitle>
            {hasSkills && (
              <Link href={`/employer/jobs/${job.id}/review`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Edit requirements
              </Link>
            )}
          </div>
          <CardDescription>
            {hasSkills
              ? "What candidates are compared against."
              : "The AI suggests requirements from your description. You review them before they count."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasSkills ? (
            <>
              <SkillChips title="Required" items={required} variant="secondary" />
              {required.length === 0 && (
                <p className="text-xs text-muted-foreground">Add at least one required skill to publish.</p>
              )}
              <SkillChips title="Preferred" items={preferred} variant="outline" />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {job.extractedAt
                  ? `AI analysis done on ${job.extractedAt.toLocaleString("en-GB")}. Review it to confirm the requirements.`
                  : DEMO_MODE ? "AI analysis is off in the hosted demo. Add the requirements yourself." :"Not analyzed yet."}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {(job.extractedAt || DEMO_MODE) && (
                  <Link href={`/employer/jobs/${job.id}/review`} className={buttonVariants()}>
                    Review requirements
                  </Link>
                )}
                {!DEMO_MODE && (
                  <form action={analyzeJob}>
                    <input type="hidden" name="id" value={job.id} />
                    <SubmitButton variant={job.extractedAt ? "outline" : "default"} pendingText="Analyzing...">
                      <Sparkles /> {job.extractedAt ? "Re-run analysis" : "Analyze with AI"}
                    </SubmitButton>
                  </form>
                )}
              </div>
              {job.extractionJson != null && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">View AI result (raw)</summary>
                  <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs">
                    {JSON.stringify(job.extractionJson, null, 2)}
                  </pre>
                </details>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
          <CardDescription>Candidates see published jobs only. A job needs at least one required skill to be published.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {job.status === "DRAFT" && (
            <form action={setJobStatus}>
              <input type="hidden" name="id" value={job.id} />
              <input type="hidden" name="status" value="PUBLISHED" />
              <Button type="submit">Publish</Button>
            </form>
          )}
          {job.status === "PUBLISHED" && (
            <>
              <form action={setJobStatus}>
                <input type="hidden" name="id" value={job.id} />
                <input type="hidden" name="status" value="DRAFT" />
                <Button type="submit" variant="outline">
                  Move back to draft
                </Button>
              </form>
              <form action={setJobStatus}>
                <input type="hidden" name="id" value={job.id} />
                <input type="hidden" name="status" value="CLOSED" />
                <Button type="submit" variant="outline">
                  Close job
                </Button>
              </form>
            </>
          )}
          {job.status === "CLOSED" && (
            <form action={setJobStatus}>
              <input type="hidden" name="id" value={job.id} />
              <input type="hidden" name="status" value="DRAFT" />
              <Button type="submit" variant="outline">
                Reopen as draft
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job description</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
            {job.description}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-destructive">Delete this job</summary>
            <form action={deleteJob} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={job.id} />
              <p className="text-muted-foreground">This permanently deletes the job and its requirements.</p>
              <Button type="submit" variant="destructive">
                Yes, delete this job
              </Button>
            </form>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}